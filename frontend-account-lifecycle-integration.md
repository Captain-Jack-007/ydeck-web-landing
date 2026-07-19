# Frontend Account Lifecycle Integration

## Scope

This guide covers web and Desktop clients consuming the PR29A account APIs. The Cloud
server remains authoritative. UI state must not change roles, plans, entitlements,
workspace ownership, or account status locally.

## Startup State

Web clients should load `GET /api/v1/account/profile` and
`GET /api/v1/account/security` after authentication. Desktop obtains the canonical
safe profile through `GET /api/v1/desktop/bootstrap`; it may call account endpoints
with its Desktop access token when the route is appropriate for Desktop UX.

Keep account state session-scoped:

```ts
interface AccountState {
  profile: SafeUserProfile | null;
  security: AccountSecuritySummary | null;
  status: "loading" | "ready" | "unauthenticated" | "error";
}
```

Do not persist permissions, passwords, verification codes, refresh tokens, or pending
security form values in local storage.

## Profile UI

Send only changed fields to `PATCH /api/v1/account/profile`. Use the returned profile
as the new source of truth. Provide the five server-supported language identifiers and
IANA time-zone identifiers. Avatar upload/storage is separate; the profile endpoint
accepts only an approved YDeck asset URL or `null`.

Handle validation errors inline. Do not attempt to update email through the profile
form.

## Email Change UI

Use a distinct security flow:

```text
start -> code entry -> confirm -> reload profile/security
```

Do not retain the code after submission. `202` from start means a challenge was
created or delivery accepted, not that the email changed. Allow cancellation through
the dedicated cancel endpoint. Treat uniqueness errors generically in UI copy.

After confirmation, other sessions are revoked; refresh workspace/account state. The
current session is intentionally retained by the backend.

## Password UI

Show change-password when `passwordConfigured` is true and set-password when false.
Never prefill or retain passwords. An OAuth/passwordless user must have a verified
email and recent authentication before setting a password.

On `RECENT_AUTH_REQUIRED`, send the user through normal authentication and retry only
after explicit user confirmation. Do not loop automatically.

## Session UI

Render `GET /api/v1/account/sessions` using server-provided `current`, type, device,
and timestamps. A missing browser or approximate location is expected. Confirmation
is required before revoking all sessions. If the current session is revoked, clear
local auth state and return to sign-in immediately.

Desktop device revocation uses the existing account-device integration documented in
[frontend-desktop-device-integration.md](./frontend-desktop-device-integration.md).

## Deletion UI

Before requesting deletion, explain the configured schedule returned by the server;
do not calculate a deletion date in the client. Send the literal `DELETE` confirmation
and current password when applicable.

Handle `SOLE_WORKSPACE_OWNER` by directing the user to transfer ownership. Handle
`ACTIVE_SUBSCRIPTION_BLOCKS_DELETION` by directing the user to the existing billing
management flow. Do not attempt either change through account APIs.

For `deletion_pending`, show recovery status and the server-supplied scheduled date.
Keep cancellation available. Product requests returning `ACCOUNT_DELETION_PENDING`
should route to this recovery screen instead of retrying.

## Export UI

Request once, store only the returned export ID, and poll its status with bounded
backoff. Stop polling on `ready`, `expired`, or `failed`. Use the authenticated
`downloadPath`; do not turn it into a public URL or append tokens to it.

The export is asynchronous. A notification may arrive when ready, but clients must
still authenticate and recheck status before download.

## Errors and Retry

- `401`: clear invalid session state and sign in.
- `RECENT_AUTH_REQUIRED`: explicit reauthentication.
- `CURRENT_PASSWORD_INVALID`: inline credential error without retaining the value.
- `ACCOUNT_RATE_LIMITED` or `ACCOUNT_EXPORT_RATE_LIMITED`: respect cooldown; no rapid retry.
- `ACCOUNT_SUSPENDED`: show the unavailable-account state.
- `ACCOUNT_DELETION_PENDING`: show recovery state.
- `404` for a session/export owned by another user: do not reveal object existence.

Security mutations should disable duplicate submission while in flight. A network
timeout does not prove the mutation failed; refresh profile/security/session/export
state before offering a retry.

