# Frontend Desktop Device Integration

## 1. Purpose and Scope

YDeck Web participates in PR28 by approving or denying Desktop pairing requests
and by letting an authenticated account inspect and revoke registered Desktop
devices. Desktop starts and completes pairing; the browser supplies only an
authenticated user decision.

The backend owns pairing state, expiry, device ownership, session invalidation,
and security events. The browser owns authentication guards, explicit confirmation,
loading/error states, and device-management UX.

For Desktop version management, the browser may display the device's version,
build, release channel, and current status from the account-device list, but it
does not calculate release eligibility itself. The authoritative update verdict
comes from the Desktop client's bootstrap `releaseControl` payload, while the
Admin surface manages release publication and compatibility policy.

> The Web Frontend must never issue, store, forward, or expose the Desktop
> application's long-lived refresh token through browser URLs or page state.

PR28 does not provide a pending-pairing preview endpoint, reauthentication step,
notification service, dedicated account-security summary, or frontend application.

## 2. Browser Approval Architecture

```text
Desktop POSTs pairing/start
  -> Desktop displays verificationUrl and userCode
  -> user opens YDeck Web and authenticates
  -> Web reads user_code from the verification URL
  -> user explicitly approves or denies
  -> backend atomically records the decision
  -> Desktop polls with its private pairing credentials
  -> Desktop exchanges an approved transaction
  -> backend creates/reuses device and issues Desktop tokens to Desktop only
```

Approval and denial require a live access token whose `clientType` is `web`.
They do not accept a Desktop/Admin/Mobile token. The routes use a bearer header,
not ambient cookie authentication, so the current implementation has no separate
CSRF middleware on these actions. If Web changes them to cookie-authenticated
mutations, it must add the existing CSRF token plus allowed-Origin checks first.

There is no explicit reauthentication requirement. Both decisions are limited to
10 requests per IP per minute and create authentication security events. The
frontend must require a visible user click and disable the action while pending.

## 3. End-to-End Pairing UX

This is the expected Web Frontend behavior when a user starts pairing from the
Desktop app.

```text
Desktop app
  -> user clicks Connect
  -> Desktop calls /api/v1/desktop/pairing/start
  -> Desktop receives pairingId, pairingSecret, userCode, verificationUrl
  -> Desktop stores pairingId + pairingSecret in memory only
  -> Desktop opens verificationUrl in the system browser

Browser / Web Frontend
  -> loads the Desktop pairing approval page with user_code in the URL
  -> if the user is not authenticated, show login/sign-up
  -> after login/sign-up, return to the same approval page
  -> show "Allow this Desktop app to connect to your YDeck account?"
  -> user chooses Allow or Deny
  -> Web calls approve or deny with only userCode and the Web access token
  -> on success, show "Return to the Desktop app"

Desktop app
  -> keeps polling /pairing/status with pairingId + pairingSecret
  -> when status becomes approved, calls /pairing/exchange once
  -> receives Desktop accessToken + refreshToken directly from the backend
  -> securely stores the Desktop refresh token
  -> calls /desktop/bootstrap with the Desktop access token
```

### If the User Is Not Logged In

When the approval page opens without a valid Web session:

- Do not show approve or deny buttons yet.
- Show the normal Web login/sign-up flow.
- Preserve only the `user_code` from the verification URL through the auth flow.
- Prefer preserving it in the redirect URL or short-lived in-memory route state.
- Do not store the code in localStorage, analytics, crash reports, or support logs.
- Do not accept `pairingId`, `pairingSecret`, device metadata, account ID, or any
  token from the URL.
- After login or sign-up completes, redirect back to the pairing approval page and
  re-render the explicit approval prompt.

The user may sign in to an existing account or create a new account. The account
that is authenticated in the browser at approval time becomes the account that the
Desktop installation is paired to. If the user signed into the wrong account, the
page must offer a safe way to sign out/switch account before approval.

### Approval Prompt

After authentication, the approval page must ask for an explicit decision. Use copy
with this meaning:

```text
Allow this Desktop app to connect to your YDeck account?
```

Show:

- the currently signed-in account;
- the normalized pairing code;
- expiry guidance such as "This request expires soon. If it expires, restart
  pairing from the Desktop app.";
- primary action: `Allow`;
- secondary/destructive action: `Deny`;
- optional action: `Switch account`.

Do not claim that the device is connected before approval succeeds and the Desktop
app completes exchange. The approval response only means the browser decision was
recorded.

### Allow

On `Allow`, call:

```http
POST /api/v1/desktop/pairing/approve
Authorization: Bearer <web_access_token>
Content-Type: application/json

{ "userCode": "<code from verification URL>" }
```

On success, show a terminal browser state:

```text
Desktop pairing approved. Return to the YDeck Desktop app to continue.
```

The browser must not receive or display Desktop access tokens, refresh tokens,
session IDs, or the pairing secret. Desktop receives auth information only after
its own `/pairing/status` poll observes `approved` and it calls
`/pairing/exchange` with the private pairing credentials it kept in memory.

### Deny

On `Deny`, call:

```http
POST /api/v1/desktop/pairing/deny
Authorization: Bearer <web_access_token>
Content-Type: application/json

{ "userCode": "<code from verification URL>" }
```

On success, show:

```text
Desktop pairing denied. You can close this window.
```

The Desktop app should stop polling after it receives `PAIRING_DENIED` and show a
local denied state with an option to start over.

### Browser Completion State

After allow or deny:

- clear the code from component state where practical;
- do not auto-close the browser window unless the platform has an explicit safe
  close affordance;
- do not redirect to a dashboard that implies pairing is fully complete;
- do not try to deliver tokens to the Desktop app through custom URL schemes,
  postMessage, localhost callbacks, clipboard, or browser storage.

The only supported token delivery path is:

```text
Desktop polling -> approved -> Desktop /pairing/exchange -> Desktop tokens
```

## 4. Frontend API Matrix

| Purpose | Method | Route | Authority | Mutation |
| --- | --- | --- | --- | --- |
| Approve pairing | POST | `/api/v1/desktop/pairing/approve` | Web access token | Pairing state |
| Deny pairing | POST | `/api/v1/desktop/pairing/deny` | Web access token | Pairing state |
| List Desktop devices | GET | `/api/v1/account/devices` | User access token | No |
| Revoke Desktop device | DELETE | `/api/v1/account/devices/:deviceId` | User access token, owner-scoped | Device + sessions |
| Revoke Desktop devices | POST | `/api/v1/account/devices/revoke-all` | User access token | Devices + sessions |
| List all auth devices | GET | `/api/v1/auth/devices` | User access token | No |
| Revoke any owned auth device | DELETE | `/api/v1/auth/devices/:deviceId` | User access token | Device + sessions |
| List account sessions | GET | `/api/v1/auth/sessions` | User access token | No |
| Revoke one account session | DELETE | `/api/v1/auth/sessions/:sessionId` | User access token | Session |
| Logout all sessions | POST | `/api/v1/auth/logout-all` | User access token | All client sessions |

Use `/account/devices` for the Desktop-only page. The broader `/auth/devices`
surface includes other registered client types and has a different DTO.

### Approve Pairing

```http
POST /api/v1/desktop/pairing/approve
Authorization: Bearer <web_access_token>
Content-Type: application/json
x-ydeck-api-version: v1
```

```ts
interface PairingApprovalRequest { userCode: string }

interface PairingApprovalResponse {
  status: "approved";
  device: {
    name?: string;
    platform: "macos" | "windows" | "linux" | "unknown";
    architecture: "arm64" | "x64" | "unknown";
    appVersion: string;
    appBuild?: string;
    releaseChannel: "stable" | "beta" | "alpha" | "nightly" | "internal";
  };
}
```

The code is 8-16 characters after trimming; the displayed server format is
`XXXXXX-XXXXXX`. Success means the decision was recorded, not that Desktop exchange
or session issuance completed. Refresh the account device list only after Desktop
has exchanged; approval itself does not create the device.

Duplicate approval, approval after denial, and approval after consumption return
`PAIRING_ALREADY_USED`. Expired returns `PAIRING_EXPIRED`; unknown returns
`PAIRING_NOT_FOUND`. These are not safe automatic retries.

### Deny Pairing

```ts
interface PairingDenialRequest { userCode: string }
interface PairingDenialResponse { status: "denied" }
```

Denial is also an atomic `pending` transition. A second denial returns
`PAIRING_DENIED`; another already-decided state returns `PAIRING_ALREADY_USED`.
Show a terminal denied confirmation and remove the code from page state/history
where the frontend controls it.

### List Desktop Devices

```http
GET /api/v1/account/devices
Authorization: Bearer <access_token>
```

Returns `{ devices: AccountDesktopDevice[] }`; see the shared contract. The response
is `private, no-store`, sorted by most recently seen then creation time. Loading,
empty, error, and stale-refetch states must not reuse another account's cached list.

### Revoke One Desktop Device

```http
DELETE /api/v1/account/devices/:deviceId
Authorization: Bearer <access_token>
```

The path uses the server `id`, not `publicId`. The backend verifies account
ownership, marks an active matching Desktop device revoked/blocked, and revokes its
active Desktop sessions. Response is always 204 for newly revoked, already revoked,
missing, or foreign IDs, preventing ownership disclosure. The operation is safe to
repeat. Refresh devices and sessions after completion.

### Revoke All Desktop Devices

```ts
interface RevokeAllDesktopDevicesRequest {
  preserveCurrentDevice?: boolean;
  reason?: string;
}

interface RevokeAllDesktopDevicesResponse {
  revokedDevices: number;
  revokedSessions: number;
}
```

`preserveCurrentDevice` defaults false. It only works when the caller's access
token is itself bound to a Desktop device. A normal Web session has no current
Desktop device, so `true` preserves none. The optional reason is 3-500 characters.

This route affects Desktop devices and their Desktop sessions only. It does not log
out browser/mobile sessions. Use `/api/v1/auth/logout-all` only when the user
explicitly requests the wider all-session effect.

## 5. Device Approval Page

Implemented UI states:

| UI state | Source | Behavior |
| --- | --- | --- |
| `loading` | Web session/code initialization | Stable form skeleton |
| `authentication_required` | No Web access token or wrong client type | Complete Web login, retain code carefully |
| `pending` | Locally valid code before decision | Show account, code, expiry guidance, actions |
| `approved` | Approval response | Decision recorded; Desktop must finish exchange |
| `denied` | Denial response or `PAIRING_DENIED` | Terminal state |
| `expired` | `PAIRING_EXPIRED` | Start again from Desktop |
| `already_used` | `PAIRING_ALREADY_USED` | Do not retry; return to Desktop/account devices |
| `not_found` | `PAIRING_NOT_FOUND` | Check code or start again |
| `rate_limited` | `PAIRING_RATE_LIMITED`/HTTP 429 | Honor rate-limit backoff |
| `internal_error` | Retryable 5xx | Bounded retry with request ID |

The current backend cannot load pending device name, platform, architecture, version,
build, channel, request time, or expiry from a user code before approval. Do not
invent this metadata from URL parameters or Desktop-to-browser messaging. The safe
device summary arrives only in the successful approval response.

The page may show the authenticated account and normalized user code. It must never
show a pairing secret/hash, Desktop token, session-family ID, installation ID/hash,
public key, hardware fingerprint, or internal pairing record ID.

## 6. Approval and Denial Behavior

- Require an explicit confirmation; do not approve on page load.
- Normalize visual formatting only. Send the user-entered code as one field.
- Disable both buttons while one decision is pending.
- Do not retry a decision automatically after an ambiguous response; refresh UX
  cannot inspect decision state, so direct the user to Desktop polling.
- Approval attaches the pending transaction to the authenticated browser user.
- A pairing has no owner before approval. At exchange, an installation already
  registered to another account fails `DEVICE_ALREADY_REGISTERED`.
- Expiration and pending-state conditions are checked atomically by the backend.
- No redirect is required after decision. A safe next step is account devices or a
  close-window message; do not claim Desktop is connected.

## 7. Account Device Management

Display these returned fields when present: name, platform, architecture,
app version/build, release channel, status, trust level, first/last seen, approval,
revocation time/reason, and the `current` marker. Treat names and platform metadata
as untrusted display strings.

The list may contain `pending`, `active`, `revoked`, `blocked`, or `disabled`, though
the pairing service creates `active` devices. A revoked device has no restore API;
the user must pair again with a new eligible installation state.

Require confirmation before revocation and state clearly that Cloud access and
device-bound Desktop sessions stop. Do not promise notification or local erasure.

> Revoking a Desktop device invalidates its Cloud session but must not instruct
> the Desktop application to delete the user's local presentation projects.

## 8. Desktop Version Management

Use `/api/v1/account/devices` as the browser account page's source of Desktop
version metadata. The user-facing device list can show server-reported
`appVersion`, `appBuild`, `releaseChannel`, `status`, and `trustLevel`.

Do not fabricate update prompts, target release numbers, download URLs, or
compatibility verdicts from cached browser state. Those come from the Desktop
client's `/api/v1/desktop/bootstrap` `releaseControl` payload and from the Admin
release-management surface.

Desktop update behavior is client-side presentation of a server decision:

- optional update: `updateAvailable=true` and `updateRequired=false`; show
  dismissible update UI using `targetRelease`;
- mandatory update: `updateRequired=true` or `mandatory=true`; block Cloud
  capability use and direct the user to the target release;
- rollout exclusion: `targetRelease=null` and `updateAvailable=false`; do not show
  the withheld release or guess eligibility;
- unsupported/blocked version: `status="blocked"` or `update_required`; show a
  blocking update/support state from the server message and support URL.

The browser should:

- refresh device rows after revoke, revoke-all, logout-all, sign-in/out, or account
  security page refocus;
- preserve the exact server-reported version/build/channel values;
- treat compatibility guidance as informational UI, not as authority;
- keep release publication and policy editing out of the user account flow.

## 9. Revoke-All Flow

For Web, present the operation as “revoke all Desktop devices”; do not offer
“preserve this device” because a browser session cannot identify a current Desktop
device. Require typed or strongly explicit confirmation for the account-wide effect.

The service performs bulk device and session updates and returns aggregate counts.
There is no per-device result or transactional partial-failure DTO. After success,
refresh `/account/devices` and `/auth/sessions`. The calling browser stays logged in.

## 10. Web Frontend Security Rules

The Web Frontend must never put Desktop access/refresh tokens or pairing secrets in
URLs, logs, analytics, crash reporting, browser storage, or page state. It must not
log the user code, display hashes/raw installation identity/public keys, approve
without a live Web session, infer device ownership, construct database IDs, or claim
device activity from local state.

It must use backend decision responses, show terminal expiry/used states, require
explicit intent, refresh account lists after mutation, disable duplicate submission,
escape device metadata, and retain only the request ID for support.

Bearer approval is not cookie CSRF. Do not silently switch it to ambient cookie
authentication without the existing double-submit CSRF and allowed-Origin checks.

## 11. Web Frontend TypeScript Contracts

Use [desktop-cloud-api-contract.md](./desktop-cloud-api-contract.md) for pairing,
device, revoke-all, session, error, and enum types. Do not import server model types.

Cache device lists in memory only and key them by authenticated account. Invalidate
after revoke, revoke-all, logout-all, sign-in/out, and browser refocus on the account
security page. Never cache a user code or approval result as authority.

## 11. Frontend Integration Checklist

- [ ] Pairing approval route guarded by a Web access session
- [ ] No pending-device preview is fabricated
- [ ] Approve and deny actions require explicit confirmation
- [ ] Expired, denied, used, not-found, and rate-limit states implemented
- [ ] Desktop-only device list uses `/api/v1/account/devices`
- [ ] Desktop version, build, channel, and status are shown from server data only
- [ ] Update eligibility is not guessed from browser state
- [ ] Single-device revocation and list refresh implemented
- [ ] Revoke-all warns that Web cannot preserve a Desktop current device
- [ ] Wider `/auth/logout-all` effect is presented separately
- [ ] Local projects are never deleted by Cloud-device UX
- [ ] Tokens, secrets, codes, hashes, and identifiers excluded from telemetry
- [ ] Request IDs are available for support
- [ ] Integration tests cover ambiguous decision and idempotent revocation behavior
