# YDeck Desktop Device Authentication

> Backend authentication reference. Use the
> [shared Desktop API contract](./implementation/desktop-cloud-api-contract.md) for
> client request and response DTOs.

## Pairing Sequence

```text
Desktop                 YDeck API                  Browser/User
   | POST pairing/start     |                           |
   |----------------------->|                           |
   | id, secret, code, URL  |                           |
   |<-----------------------|                           |
   |                        |<-- web login + code ------|
   |                        |--- device metadata ------>|
   |                        |<-- approve or deny -------|
   | GET pairing/status     |                           |
   |----------------------->|                           |
   | approved               |                           |
   |<-----------------------|                           |
   | POST pairing/exchange  |                           |
   |----------------------->|                           |
   | access + refresh token |                           |
   |<-----------------------|                           |
```

Pairing approval uses an existing web bearer session. Long-lived tokens never pass through the browser URL.

## Start Pairing

`POST /api/v1/desktop/pairing/start` accepts:

```json
{
  "deviceName": "Work Mac",
  "platform": "macos",
  "architecture": "arm64",
  "appVersion": "1.4.0",
  "appBuild": "140",
  "releaseChannel": "stable",
  "installationId": "desktop-generated-installation-id"
}
```

`deviceName`, `architecture`, `appBuild`, `releaseChannel`, and `publicKey` are optional. The installation identifier must be generated and stored by the desktop application; it is not a hardware fingerprint. The server stores only an HMAC-derived value. Reinstallation without secure continuity creates a new installation.

The response contains `pairingId`, `pairingSecret`, `userCode`, `verificationUrl`, `expiresAt`, `expiresIn`, and `pollIntervalSeconds`. Keep the pairing secret in memory and never place it in a URL, log, telemetry event, or browser message.

## Approval and Denial

The browser submits only:

```json
{ "userCode": "ABCDEF-123456" }
```

Approval and denial require a live web access token. Because approval accepts bearer authentication rather than ambient cookie authentication, an unrelated page cannot approve through cookie CSRF. The current backend has no pending-pairing preview endpoint, so the Web UI cannot display server-returned device metadata before confirmation. The approval response contains safe device metadata only after the decision; treat those values as untrusted display text.

Codes are one-time, 48-bit random hexadecimal values. The stored code and transaction secret are protected hashes. Transactions expire, decision transitions require `pending` and unexpired state, and exchange atomically claims `approved` before session issuance.

## Poll and Exchange

Poll no faster than `pollIntervalSeconds`. Polling requires both the public pairing ID and secret and is constrained by IP rate limiting and an atomic transaction poll counter.

On `approved`, call `/pairing/exchange` once with the same `pairingId` and `pairingSecret`. The exchange creates or safely reuses the installation record, resolves an authorized workspace, creates a desktop session, and consumes the transaction. Concurrent or repeated exchanges return `PAIRING_ALREADY_USED`.

## Token Lifecycle

- Access tokens are short-lived JWTs with issuer validation, audience `ydeck-desktop`, `clientType: desktop`, session ID, user ID, and device ID.
- Access tokens are not the source of truth. Every request resolves the live session, user, and device.
- Refresh tokens are longer-lived, rotating, and stored only as hashes server-side.
- Every successful refresh returns a replacement refresh token. Persist the replacement before discarding the old value.
- Reuse of a rotated token revokes the entire refresh family.
- Web refresh tokens are rejected by the desktop refresh endpoint.
- Revoked or blocked devices and disabled users cannot authenticate or refresh.

Store refresh tokens in the OS credential store: macOS Keychain, Windows Credential Manager, or Linux Secret Service. Keep access tokens in memory when practical. Never use localStorage, project files, crash reports, shell history, or application logs.

## Logout and Revocation

`POST /desktop/session/logout` accepts the current refresh token and returns `204`; invalid or already-revoked tokens are treated idempotently.

Account device management is owner-scoped. Revoking a device immediately marks it blocked/revoked and revokes all active desktop sessions bound to it. `revoke-all` requires an explicit `preserveCurrentDevice` boolean. A workspace administrator receives no authority over a member's personal devices.

Local project deletion is never part of server revocation. The desktop should clear Cloud tokens and Cloud caches while preserving local projects under its local encryption policy.

## Device Lifecycle and Retention

Devices move through active, revoked, or blocked states and retain first/last seen, approval, revocation reason, and audit timestamps. Raw hardware fingerprints are prohibited. Pairing records are automatically removed 24 hours after their expiry timestamp. Session and security-event retention follows the existing authentication/account retention policy; PR 28 adds no independent deletion policy.
