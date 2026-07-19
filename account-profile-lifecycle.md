# YDeck User Profile and Account Lifecycle

## Overview

The Cloud API is authoritative for user identity, profile preferences, credentials,
sessions, Desktop devices, and account lifecycle state. Profile data is deliberately
separate from workspace roles, billing, plans, entitlements, usage, and admin access.

All routes below require a live bearer session and operate only on the authenticated
user. They do not accept a user ID. Responses use the existing structured API error
format and never expose credential hashes, tokens, provider secrets, raw IP addresses,
or admin-only fields.

The machine-readable contract is [openapi-account-lifecycle.yaml](./openapi-account-lifecycle.yaml).

## Safe Profile

`GET /api/v1/account/profile` returns the canonical profile:

```json
{
  "data": {
    "id": "<user-id>",
    "email": "user@example.com",
    "emailVerified": true,
    "displayName": "Example User",
    "avatarUrl": null,
    "preferredLanguage": "en",
    "timeZone": "Asia/Tokyo",
    "locale": "en-JP",
    "accountStatus": "active",
    "deletionRequestedAt": null,
    "deletionScheduledFor": null,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "updatedAt": "2026-07-15T00:00:00.000Z"
  }
}
```

`PATCH /api/v1/account/profile` accepts a strict partial object containing only:

```json
{
  "displayName": "Example User",
  "preferredLanguage": "uz-Latn",
  "timeZone": "Asia/Tokyo",
  "locale": "uz-Latn-UZ",
  "avatarUrl": null
}
```

Supported profile languages are `en`, `ru`, `uz-Latn`, `uz-Cyrl`, and `zh`. Time
zones must be valid IANA identifiers. Locale values are normalized by `Intl.Locale`.
Avatar values must be `null` or an HTTPS URL on the configured YDeck API origin under
`/v1/assets/`. Email, status, roles, plans, and permissions are rejected here.

## Security Summary

`GET /api/v1/account/security` returns email verification, configured authentication
methods, password presence, active session and Desktop device counts, password/email
change timestamps, and deletion state. It is a summary, not a credential endpoint.

## Email Change

Email changes use the existing purpose-bound, hashed authentication challenge system.

1. `POST /api/v1/account/email/change/start` with `newEmail` and, when the account has
   a password, `currentPassword`.
2. The API validates recent authentication, normalizes the address, prevents duplicate
   ownership, applies challenge cooldown and attempt policy, sends the code to the new
   address, and notifies the current address.
3. `POST /api/v1/account/email/change/confirm` with `code` consumes the challenge and
   atomically updates both the user and email identity when transactions are available.
4. Other sessions are revoked after a successful change. The current session remains.
5. `POST /api/v1/account/email/change/cancel` invalidates the pending challenge and is
   safe to repeat.

The account email is never changed by the start operation. API errors do not disclose
whether an arbitrary address belongs to another account.

## Password Management

- `POST /api/v1/account/password/change` requires recent authentication, the current
  password, and a policy-compliant different password. Other sessions are revoked.
- `POST /api/v1/account/password/set` is available to a recently authenticated,
  email-verified passwordless/OAuth account. It fails when a password already exists.
- The existing reset-password flow remains authoritative for forgotten passwords. A
  completed reset records an account event and sends a security notification.

Passwords are never logged or returned. Password hashes remain in the existing
`PasswordCredential` boundary.

## Sessions

`GET /api/v1/account/sessions` returns safe session metadata and marks the current
session. Browser/location fields remain `null` because the server does not retain or
infer those values in a user-visible form.

| Method | Path | Behavior |
| --- | --- | --- |
| `DELETE` | `/api/v1/account/sessions/:sessionId` | Idempotently revokes an owned session |
| `POST` | `/api/v1/account/sessions/revoke-others` | Recent-auth protected; preserves current session |
| `POST` | `/api/v1/account/sessions/revoke-all` | Requires `confirmation: "REVOKE"` and password when configured; invalidates pending pairing exchanges |

Revoking the current or all sessions clears browser session cookies. Desktop device
management remains available through the existing `/api/v1/account/devices` routes.

## Account Deletion

Deletion is recoverable and asynchronous:

```text
active -> deletion_pending -> deleted
```

`POST /api/v1/account/deletion/request` requires recent authentication,
`confirmation: "DELETE"`, and the current password when configured. It rejects users
who are the last owner of an active non-personal workspace or own a blocking paid
subscription. A successful request schedules deletion using
`ACCOUNT_DELETION_GRACE_DAYS`, preserves the current recovery session, and revokes
other sessions.

While deletion is pending, product APIs fail with `ACCOUNT_DELETION_PENDING`. Profile,
security, session, Desktop bootstrap, logout, and
`POST /api/v1/account/deletion/cancel` remain reachable. Cancellation is allowed only
before processing begins and restores `active` status.

The explicit `npm run process:account` worker claims due accounts once, rechecks
workspace and subscription constraints, revokes credentials/devices/pairings, removes
non-personal memberships, archives personal workspaces, and anonymizes the user. It
does not delete shared workspace content. Failed jobs release their processing claim
for a later bounded retry and emit `account.deletion.failed`.

## Account Export

`POST /api/v1/account/export/request` is recent-auth protected and returns `202` with
a persistent export job. Requests have a server-side cooldown. The explicit account
worker builds the export outside the HTTP request.

`GET /api/v1/account/export/:exportId` returns `pending`, `processing`, `ready`,
`expired`, or `failed`. A ready job includes an authenticated `downloadPath`.
`GET /api/v1/account/export/:exportId/download` serves the owned JSON export with
private, no-store caching and attachment headers.

Exports contain the safe profile, authentication-method summary, memberships,
user-visible subscription references, session/device summaries, presentation
ownership references, and safe security events. They exclude hashes, tokens, other
users' data, internal risk data, admin notes, and provider credentials. Payloads expire
according to `ACCOUNT_EXPORT_TTL_HOURS`.

## Recent Authentication

Sensitive operations check the live session's creation time against
`ACCOUNT_RECENT_AUTH_SECONDS`. A refresh token does not silently make an old login
recent. Accounts with a password must also prove the current password where the route
requires stronger confirmation. Clients receiving `RECENT_AUTH_REQUIRED` should run
the normal sign-in flow and retry with the new session; they must not attempt to infer
or bypass server policy.

## Notifications and Audit

Account mutations use the existing provider-neutral authentication mail sender.
Security notifications cover email changes, password changes/resets, session
revocation, deletion, and export readiness. Notification failure is observable but
does not roll back a completed security mutation.

Events use the existing `AuthSecurityEvent` store with `account.*` names. Only safe
field names, request/session/device identifiers, outcome, reason codes, and protected
network/user-agent fingerprints are recorded. Passwords, codes, and raw tokens are
never event metadata.

## API Error Codes

Clients should branch on stable codes, including `PROFILE_VALIDATION_FAILED`,
`INVALID_TIME_ZONE`, `EMAIL_CHANGE_UNAVAILABLE`, `EMAIL_CHANGE_NOT_PENDING`,
`EMAIL_CHANGE_CODE_INVALID`, `EMAIL_CHANGE_CODE_EXPIRED`, `RECENT_AUTH_REQUIRED`,
`CURRENT_PASSWORD_INVALID`, `PASSWORD_POLICY_FAILED`, `SESSION_NOT_FOUND`,
`SOLE_WORKSPACE_OWNER`, `ACTIVE_SUBSCRIPTION_BLOCKS_DELETION`,
`ACCOUNT_DELETION_ALREADY_PENDING`, `ACCOUNT_DELETION_NOT_PENDING`,
`ACCOUNT_EXPORT_RATE_LIMITED`, `ACCOUNT_SUSPENDED`, and
`ACCOUNT_DELETION_PENDING`.

Rate-limit responses use `ACCOUNT_RATE_LIMITED`. Clients should respect response
headers and avoid automatic retries of security mutations.
