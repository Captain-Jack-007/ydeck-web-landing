# YDeck Frontend Authentication Integration

## Overview

YDeck Cloud uses server-backed, session-based authentication. Access tokens are short-lived credentials, not the source of truth. For every authenticated request, the API validates the token and resolves the live server-side session and current user status.

```text
Frontend
   |
   | access token
   v
YDeck API
   |
   v
Session Resolver
   |
   v
User Identity
```

Authentication answers who the user is and whether the session is usable. Workspace membership, plans, permissions, entitlements, usage limits, and billing state are separate authorization concerns. Frontends must not infer those capabilities from an access token or user profile.

All stable user-facing routes in this guide use the `/api/v1` prefix. Transitional `/v1/auth` aliases exist, but new clients should not depend on them.

## Authentication Architecture

YDeck separates:

- The user account and its status.
- Email and Google identities.
- Password credentials.
- Verification challenges.
- Devices.
- Server-side sessions.
- Short-lived access tokens and rotating refresh tokens.

An access token carries only session-binding information. The API can reject it immediately when its session is revoked, its user is suspended, or its user is deleted. Client type and device metadata never grant authorization.

Web and Desktop use different refresh-token transports:

| Client | Access token | Refresh token |
| --- | --- | --- |
| Web | Returned in JSON; keep in memory | Secure `HttpOnly` cookie managed by the browser |
| Desktop | Returned in JSON; keep in process memory | Returned in JSON; store only in OS secure storage |

## Supported Authentication Methods

YDeck currently supports these authentication methods:

```typescript
type AuthenticationMethod =
  | "google_oauth"
  | "email_password"
  | "email_code";
```

Email authentication supports registration, email verification, one-time-code login, password login, password reset, and authenticated password change. Registration currently requires a password and then email verification.

Google authentication uses OpenID Connect authorization code flow. The backend owns Google code exchange and token validation. The frontend never receives or stores Google provider tokens.

## Email Authentication Flow

```text
User enters email

Frontend
    |
POST /api/v1/auth/email/request-code

Backend creates challenge

Frontend
    |
POST /api/v1/auth/email/verify-code

Backend validates:
- email
- challenge
- purpose
- expiry
- attempts

Backend creates session

Frontend receives authentication result
```

Verification codes are short-lived and single-use. Keep a code only in the active form field; never persist it, log it, add it to analytics, or place it in a URL.

### Registration

Create a pending account and registration challenge:

```http
POST /api/v1/auth/email/register
Content-Type: application/json

{
  "email": "person@example.invalid",
  "password": "<user_entered_password>",
  "displayName": "Example User",
  "locale": "en"
}
```

`displayName` and `locale` are optional. Supported locales are `en`, `ru`, `uz`, and `zh`. Password length is validated by backend configuration; the UI should present backend validation messages rather than duplicate a fixed policy.

A `201` response has this contract:

```typescript
interface RegistrationChallengeResponse {
  status: "verification_required";
  challengeId: string;
  expiresAt: string;
  resendAfterSeconds: number;
}
```

Verify this challenge with purpose `register`. The account cannot use protected product APIs until verification succeeds. Common failures are `AUTH_REGISTRATION_UNAVAILABLE`, `AUTH_RATE_LIMITED`, validation errors, and the sanitized `AUTH_EMAIL_*` delivery errors documented in [Frontend Authentication Email Integration](./implementation/frontend-auth-email-integration.md).

### Request Verification Code

Request a purpose-bound challenge:

```http
POST /api/v1/auth/email/request-code
Content-Type: application/json

{
  "email": "person@example.invalid",
  "purpose": "login",
  "locale": "en"
}
```

Known purposes are `register`, `login`, `verify_email`, `reset_password`, and `change_email`. A client should send only the purpose required by its implemented flow. Password reset has dedicated endpoints described below.

A `202` response contains `challengeId`, `expiresAt`, and `resendAfterSeconds`. It never contains the code. Disable resend controls until the cooldown expires. Common failures are `AUTH_RATE_LIMITED`, request validation errors, and the sanitized `AUTH_EMAIL_*` delivery errors.

### Verify Code

Submit the exact email, purpose, challenge ID, and code together:

```http
POST /api/v1/auth/email/verify-code
Content-Type: application/json

{
  "email": "person@example.invalid",
  "purpose": "login",
  "challengeId": "<challenge_id>",
  "code": "<user_entered_code>",
  "clientType": "web",
  "device": {
    "clientType": "web",
    "deviceName": "Current browser",
    "platform": "web",
    "installationId": "<non_secret_installation_id>"
  }
}
```

`clientType` defaults to `web`. If both top-level and device client types are supplied, they must match. Device metadata is optional and descriptive; it is not an authorization credential.

For Web, the response sets refresh and CSRF cookies and returns:

```typescript
interface WebAuthenticationResponse {
  user: CurrentUser;
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  sessionId: string;
  clientType: "web";
}
```

The Web response intentionally omits the refresh token. Desktop responses include it because Desktop uses secure-storage transport. Common failures are `AUTH_CODE_INVALID`, `AUTH_CODE_EXPIRED`, `AUTH_CODE_ATTEMPTS_EXCEEDED`, `AUTH_EMAIL_NOT_VERIFIED`, and `AUTH_RATE_LIMITED`.

### Login

Email-code login is a two-request flow:

1. Request a challenge using purpose `login`.
2. Verify it using the same normalized email, purpose, and returned `challengeId`.

Successful verification creates a session and returns the same authentication contract described above. Do not create a new account when login returns `AUTH_INVALID_CREDENTIALS`; show a generic authentication failure and let the user choose registration explicitly.

### Password Login

```http
POST /api/v1/auth/email/login
Content-Type: application/json

{
  "email": "person@example.invalid",
  "password": "<user_entered_password>",
  "clientType": "web"
}
```

Optional `device` metadata uses the same shape as code verification. A successful response has the Web or Desktop authentication contract according to `clientType`. Incorrect credentials use the generic `AUTH_INVALID_CREDENTIALS` error. Repeated failures may return `AUTH_RATE_LIMITED` during a temporary lockout.

Never retain a password after submission. Password managers and OS-native credential facilities may manage credentials independently; application state must not.

### Password Reset

Request a reset challenge:

```http
POST /api/v1/auth/email/password-reset/request
Content-Type: application/json

{
  "email": "person@example.invalid",
  "locale": "en"
}
```

The `202` response has status `accepted` plus `challengeId`, `expiresAt`, and `resendAfterSeconds`. Treat the response generically; do not use it to infer whether an account exists.

Confirm the reset:

```http
POST /api/v1/auth/email/password-reset/confirm
Content-Type: application/json

{
  "email": "person@example.invalid",
  "challengeId": "<challenge_id>",
  "code": "<user_entered_code>",
  "newPassword": "<new_user_entered_password>"
}
```

Success returns `204 No Content`, clears Web authentication cookies, and revokes existing sessions. The frontend must clear local authentication state and require a new login. Invalid, expired, or exhausted challenges return the corresponding code errors.

Authenticated password change is available at `POST /api/v1/auth/email/change-password` with `currentPassword` and `newPassword`. It requires a valid access token, returns `204`, and revokes the user's other sessions while preserving the current session.

## Google OAuth Flow

The frontend never handles Google access tokens, refresh tokens, client secrets, ID-token validation, or provider profile trust decisions.

```text
User clicks "Continue with Google"

Frontend opens YDeck OAuth start route

Google authentication

Backend validates:
- state
- nonce
- PKCE
- issuer
- audience
- Google subject

Backend creates YDeck session

Frontend receives authenticated state
```

### Browser Flow

Navigate the browser to:

```text
GET /api/v1/auth/google/start?redirect=<approved_frontend_redirect>
```

`redirect` must be an absolute destination already approved by backend configuration. This endpoint responds with an HTTP redirect to Google; it does not return OAuth configuration as JSON.

Google redirects to `GET /api/v1/auth/google/callback`. The backend validates and consumes the authorization request, creates the YDeck Web session, sets cookies, and redirects to the approved frontend destination with `auth=success`.

On that destination, do not treat the query flag as proof of authentication. Remove it from browser history, call `POST /api/v1/auth/refresh` with cookies and CSRF, then call `GET /api/v1/me`. The live session and user response are authoritative.

Common failures are `AUTH_REDIRECT_NOT_ALLOWED`, `AUTH_OAUTH_STATE_INVALID`, `AUTH_OAUTH_PROVIDER_ERROR`, and `AUTH_RATE_LIMITED`.

### Desktop Browser-Assisted Flow

Desktop generates a high-entropy one-time verifier locally and computes its base64url SHA-256 challenge. The verifier remains only in Desktop memory until exchange.

1. `POST /api/v1/auth/desktop/requests` with `provider: "google"` and `authorizationCodeChallenge`.
2. Receive `requestId`, `browserUrl`, and `expiresAt`.
3. Open `browserUrl` in the system browser.
4. After Google and the YDeck callback approve the request, call `POST /api/v1/auth/desktop/exchange`.

The exchange request contains:

```typescript
interface DesktopExchangeRequest {
  requestId: string;
  authorizationCode: string; // Original one-time verifier.
  device: {
    deviceName?: string;
    platform?: "macos" | "windows" | "linux" | "web" | "ios" | "android";
    architecture?: string;
    appVersion?: string;
    installationId?: string;
  };
}
```

The exchange is expiring and single-use. Its successful response has `clientType: "desktop"` and includes both access and refresh tokens. No token appears in the browser URL or callback page. There is currently no polling endpoint. Desktop should wait until the browser reports completion and the user returns to the app before attempting exchange. An invalid or expired request should restart the flow; local cancellation is safe because the server request expires automatically.

## Session Management

### Access Tokens

Access tokens are short-lived and contain minimal identity/session claims. Keep them in memory and send them to protected APIs:

```http
Authorization: Bearer <access_token>
```

Do not decode a token to make authorization, plan, workspace, or entitlement decisions. Do not persist it unless a client platform has an approved threat model and storage policy.

### Refresh Tokens

Refresh tokens are longer-lived, rotate on every successful refresh, and must never be logged or sent to analytics, crash reporting, URLs, or telemetry.

- Web: the browser owns the `HttpOnly`, `Secure`, `SameSite=Lax` refresh cookie. JavaScript cannot and should not read it.
- Desktop: replace the stored refresh token after every refresh and store it only in macOS Keychain, Windows Credential Manager, or Linux Secret Service/keyring.

Never put a refresh token in `localStorage`, `sessionStorage`, IndexedDB, a configuration file, or application logs.

### Token Refresh

```http
POST /api/v1/auth/refresh
Content-Type: application/json
```

Web sends an empty JSON object, browser cookies, an exact approved `Origin`, and `X-CSRF-Token` equal to the readable `ydeck_csrf` cookie. Requests must use credentialed fetch behavior. The response returns a new access token and rotates cookies; it does not return a Web refresh token.

Desktop sends `{ "refreshToken": "<securely_loaded_refresh_token>" }`. The response returns the next access token and replacement refresh token. Replace the secure-storage value atomically. If secure persistence fails after rotation, clear the local session and require authentication rather than retrying the old token.

Coalesce simultaneous refresh attempts into one in-flight operation. Retry the original protected request at most once. Reusing an old rotated token can revoke the entire refresh family.

### Logout

`POST /api/v1/auth/logout` is idempotent.

- Web sends cookies plus the same CSRF protections as refresh. The backend revokes the session when possible and clears cookies.
- Desktop sends its refresh token in the body, then deletes access and refresh tokens from memory and secure storage.

Treat `204 No Content` as success. Clear local authentication state even if a network failure makes server confirmation unavailable, while offering the user an appropriate retry path.

### Logout All Sessions

`POST /api/v1/auth/logout-all` requires the current access token and returns `204`. It revokes every active session for the user and clears Web cookies. Immediately clear local authentication state.

Users can inspect sessions with `GET /api/v1/auth/sessions` and revoke one with `DELETE /api/v1/auth/sessions/:sessionId`. Revoking the current session clears its Web cookies. Device management is similarly available at `GET /api/v1/auth/devices` and `DELETE /api/v1/auth/devices/:deviceId`; revoking a device revokes its active sessions.

## Current User API

`GET /api/v1/me` requires an access token and returns only the safe account contract:

```typescript
interface CurrentUser {
  id: string;
  primaryEmail: string;
  displayName?: string;
  avatarUrl?: string;
  status: "pending_verification" | "active" | "suspended" | "restricted" | "deleted";
  emailVerified: boolean;
  authenticationMethods: AuthenticationMethod[];
  createdAt: string;
}
```

It does not return passwords, token hashes, provider tokens, raw security metadata, permissions, plans, or entitlements. Use this endpoint after boot-time refresh and after OAuth completion. A successful response is the signal to transition to authenticated UI.

## Protected API Requests

Attach the access token to private Cloud API requests. A valid JWT alone is insufficient: the session and user must still be active server-side. Never send a user ID as proof of identity; resource routes derive it from the authenticated context.

Deck, job, export, private asset, and realtime operations add resource or workspace checks after authentication. Public assets are public only when the backend's explicit privacy, approval, safety, provenance, and license policy permits it.

Socket.IO authentication must pass the access token in the socket auth payload or `Authorization` header. Never place it in a WebSocket query string. Reconnect with a refreshed access token rather than attempting to mutate the identity of an existing socket.

## Authentication State Management

A minimal client state can use:

```typescript
interface AuthState {
  user?: CurrentUser;
  sessionStatus: "loading" | "authenticated" | "unauthenticated";
  accessToken?: string;
}
```

Recommended startup sequence:

1. Start in `loading` without rendering protected content.
2. Web attempts cookie refresh; Desktop loads the refresh token from secure storage and attempts body refresh.
3. On refresh success, store the access token in memory and call `/api/v1/me`.
4. Enter `authenticated` only after `/me` succeeds.
5. On an expected no-session response, clear state and enter `unauthenticated`.

Do not store passwords, verification codes, provider tokens, or Web refresh tokens. Do not use cached user data as proof that a session remains valid. Clear user and access-token state atomically on logout, revocation, or terminal refresh failure.

## Error Handling

API errors use this envelope:

```typescript
interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

Handle stable codes, not English message text:

| Code | Frontend behavior |
| --- | --- |
| `AUTH_REQUIRED` | Attempt one refresh when appropriate; otherwise show sign-in. |
| `AUTH_INVALID_CREDENTIALS` | Show a generic authentication failure without identifying which field was wrong. |
| `AUTH_EMAIL_NOT_VERIFIED` | Return to the verification flow; do not open protected UI. |
| `AUTH_SESSION_EXPIRED` | Attempt refresh once; clear state if refresh also fails. |
| `AUTH_SESSION_REVOKED` | Clear all local session state and require authentication. |
| `AUTH_REFRESH_REUSE_DETECTED` | Clear all local credentials and require authentication; do not retry the old token. |
| `AUTH_CODE_INVALID` | Keep the challenge flow open and allow a bounded retry. |
| `AUTH_CODE_EXPIRED` | Request a new challenge. |
| `AUTH_CODE_ATTEMPTS_EXCEEDED` | Stop retries and request a new challenge after permitted. |
| `AUTH_RATE_LIMITED` | Respect the response and cooldown; do not run automatic retry loops. |
| `AUTH_OAUTH_STATE_INVALID` | Restart OAuth from the YDeck start endpoint. |
| `AUTH_OAUTH_PROVIDER_ERROR` | Show a generic provider failure and allow a fresh attempt. |
| `AUTH_CSRF_INVALID` | Do not retry blindly; reload authentication state and verify credentialed requests. |

Validation failures may use general request error codes with structured `details`. Unexpected `5xx` responses should show a recoverable service error without exposing response internals.

## Security Requirements

- Use TLS in deployed environments.
- Use credentialed requests for Web authentication cookie flows.
- Keep access tokens in memory and refresh tokens in the designated secure transport.
- Redact authentication bodies and `Authorization`, cookie, and CSRF headers from logging and monitoring.
- Never embed OAuth client secrets or server auth secrets in Web or Desktop binaries.
- Never trust frontend-provided Google profile data.
- Never put authentication codes or tokens in URLs.
- Prevent multiple concurrent refreshes and infinite 401 retry loops.
- Clear sensitive form fields promptly after submission.
- Treat device names and installation IDs as untrusted display metadata.
- Preserve generic failure UX where account enumeration would otherwise be possible.

## Frontend Implementation Guidelines

- Centralize access-token attachment, refresh coalescing, and terminal session cleanup in one API client boundary.
- Keep route guards in `loading` until boot-time session resolution completes.
- Separate authentication state from workspace, plan, and entitlement stores.
- Use a finite-state flow for code request, cooldown, verification, expiry, and retry exhaustion.
- Preserve the exact `challengeId`, email, and purpose together for the lifetime of a verification screen.
- Use browser navigation for Google start and callback; do not fetch Google endpoints from application code.
- Use the system browser for Desktop OAuth; never embed provider credentials in the application.
- Replace Desktop refresh tokens atomically after rotation.
- On current-session or device revocation, clear local state immediately rather than waiting for token expiry.
- Test expired access, revoked session, refresh reuse, code expiry, rate limiting, OAuth cancellation, offline Desktop refresh, and multi-tab refresh contention.

## Future Workspace and Entitlement Integration

Future work will add workspace switching, memberships, plans, entitlements, usage limits, and billing state. Do not add user-level shortcuts such as:

```javascript
if (user.isPro) {
  // Incorrect ownership model.
}
```

Prepare for this resolution chain instead:

```text
user
  -> active workspace
  -> membership
  -> entitlements
```

Authentication should remain usable without those future modules. Feature access must eventually use server-provided workspace authorization and entitlement results, not JWT contents or inferred email domains.

## API Reference Summary

| Endpoint | Authentication | Purpose and contract | Common errors |
| --- | --- | --- | --- |
| `POST /api/v1/auth/email/register` | Public, rate-limited | Email, password, optional display name/locale; returns registration challenge | Registration unavailable, rate limited, mail unavailable |
| `POST /api/v1/auth/email/request-code` | Public, rate-limited | Email, purpose, optional locale; returns challenge metadata | Rate limited, mail unavailable |
| `POST /api/v1/auth/email/verify-code` | Public, rate-limited | Email, purpose, challenge, code, optional client/device; creates session | Invalid/expired/exhausted code, account status |
| `POST /api/v1/auth/email/login` | Public, rate-limited | Email, password, optional client/device; creates session | Invalid credentials, rate limited, account status |
| `POST /api/v1/auth/email/password-reset/request` | Public, rate-limited | Email and optional locale; returns accepted challenge | Rate limited, mail unavailable |
| `POST /api/v1/auth/email/password-reset/confirm` | Public, rate-limited | Email, challenge, code, new password; returns `204` and revokes sessions | Invalid/expired code, invalid credentials |
| `POST /api/v1/auth/email/change-password` | Access token | Current and new password; returns `204`, revokes other sessions | Required, invalid credentials |
| `GET /api/v1/auth/google/start` | Public, rate-limited | Approved `redirect` query; redirects to Google | Redirect not allowed, provider unavailable |
| `GET /api/v1/auth/google/callback` | OAuth callback | State and provider code; sets Web cookies or approves Desktop request | Invalid state, provider error |
| `POST /api/v1/auth/desktop/requests` | Public, rate-limited | Google provider and verifier challenge; returns browser request metadata | Provider unavailable, rate limited |
| `POST /api/v1/auth/desktop/exchange` | Public, rate-limited | Request ID, original verifier, device metadata; returns Desktop tokens | Invalid/expired request, rate limited |
| `POST /api/v1/auth/refresh` | Refresh cookie or body token | Rotates refresh credential and returns a new access token | Expired, revoked, reuse detected, CSRF invalid |
| `POST /api/v1/auth/logout` | Refresh cookie or body token | Idempotently revokes session and clears cookies; returns `204` | CSRF invalid for cookie transport |
| `POST /api/v1/auth/logout-all` | Access token | Revokes all user sessions and returns `204` | Required, revoked session |
| `GET /api/v1/me` | Access token | Returns safe current-user identity | Required, expired/revoked session |
| `GET /api/v1/auth/sessions` | Access token | Returns owned sessions and current-session marker | Required, revoked session |
| `DELETE /api/v1/auth/sessions/:sessionId` | Access token | Revokes an owned session; returns `204` | Required, invalid ID |
| `GET /api/v1/auth/devices` | Access token | Returns owned authentication devices | Required, revoked session |
| `DELETE /api/v1/auth/devices/:deviceId` | Access token | Revokes owned device and its sessions; returns `204` | Required, invalid ID |
