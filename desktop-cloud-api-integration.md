# Desktop Cloud API Integration

## 1. Device Pairing Flow

YDeck Desktop is an untrusted public client. Pairing binds one locally generated
installation identity to an existing user after explicit browser approval.

```text
POST pairing/start
  -> keep pairingId + pairingSecret in memory
  -> show userCode and open verificationUrl in system browser
  -> poll pairing/status no faster than pollIntervalSeconds
  -> on approved, POST pairing/exchange once
  -> securely store returned refresh token
  -> call bootstrap with returned access token
```

### Start

```http
POST /api/v1/desktop/pairing/start
Content-Type: application/json
x-ydeck-api-version: v1

{
  "deviceName": "Design workstation",
  "platform": "windows",
  "architecture": "x64",
  "appVersion": "1.4.0",
  "appBuild": "140",
  "releaseChannel": "stable",
  "installationId": "locally-generated-random-installation-id"
}
```

Generate `installationId` randomly and persist it in protected application storage.
Do not derive it from hardware. Optional `publicKey` is stored for future continuity
but is not currently proof-of-possession.

The response provides pairing ID, secret, display code, verification URL, expiry,
and five-second poll interval. The URL contains the user code only. Never append the
pairing secret or tokens.

### Poll

```http
GET /api/v1/desktop/pairing/status?pairingId=<id>&pairingSecret=<secret>
x-ydeck-api-version: v1
```

The implemented status contract carries the secret in the query string. Construct
the request only in memory and ensure client/proxy diagnostics redact the full query.
Do not place this URL in browser history, analytics, crash reports, or support logs.

Poll at the returned interval. HTTP 200 returns only `pending` or `approved`.
The response also sets `Retry-After` to the same number of seconds as
`pollIntervalSeconds`.
Stop on denied, expired, already-used, not-found, or rate-limited errors. The backend
also enforces a per-transaction maximum poll count.

### Exchange

```http
POST /api/v1/desktop/pairing/exchange
Content-Type: application/json

{ "pairingId": "dp_safe_example", "pairingSecret": "<memory-only-secret>" }
```

Call once after `approved`. The server atomically claims the transaction, creates or
reuses an eligible installation, resolves an active workspace, creates a device-bound
Desktop session, then marks the pairing consumed. Concurrent/repeated exchange returns
`PAIRING_ALREADY_USED`.

Exchange returns `accessToken`, rotating `refreshToken`, `tokenType`, `expiresIn`,
`clientType="desktop"`, and a safe device summary. It does not return internal
session/family IDs or refresh expiry. Clear pairing credentials after successful
secure token persistence.

## 2. Desktop Session Lifecycle

### Access Token

- JWT audience is the server-configured Desktop audience, distinct from Web.
- Lifetime is returned as `expiresIn`; do not hardcode it.
- Claims contain minimal user/session/device/client identity.
- Every protected request revalidates live user, session, and device state.
- Send as `Authorization: Bearer <desktop_access_token>`.

### Refresh Rotation

```http
POST /api/v1/desktop/session/refresh
Content-Type: application/json

{ "refreshToken": "<desktop_refresh_token>" }
```

Serialize refresh operations per installation. Every success consumes the submitted
token and returns a replacement. Atomically persist the replacement before allowing
another refresh. A browser refresh token is rejected.

Reuse of a rotated token or a concurrent refresh race revokes the entire token
family, records `desktop_refresh_reuse_detected`, and returns
`REFRESH_TOKEN_REUSED`. Clear credentials and require pairing again.

### Live Session Read

```http
GET /api/v1/desktop/session
Authorization: Bearer <desktop_access_token>
```

Returns safe session status, current workspace ID, session expiry/last-used/creation
times, and safe device ID/public ID/status/trust/last-seen. It is `private, no-store`.

### Logout

```http
POST /api/v1/desktop/session/logout
Content-Type: application/json

{ "refreshToken": "<desktop_refresh_token>" }
```

Logout returns 204. Invalid, Web, expired, and already-revoked values also return 204.
After the request, remove local Cloud tokens. Do not delete local projects or BYOK
credentials.

### Revocation

Device/account revocation makes subsequent access and refresh fail. Account-owner
device revocation also marks active bound Desktop sessions revoked. Admin generic
revocation changes device status; live device checks still block Cloud access.

## 3. Secure Token Storage

Store Desktop refresh tokens only in an OS credential service:

- macOS Keychain
- Windows Credential Manager or equivalent platform vault
- Linux Secret Service or equivalent platform vault

Keep access tokens and pairing secrets in memory when practical. Never store tokens
in plaintext configuration, localStorage, project files, logs, crash reports,
analytics, shell history, Git, or support bundles. Keep BYOK credentials in a
separate provider-credential lifecycle.

If replacement refresh-token persistence fails after a successful rotation, the old
token is already consumed. Clear uncertain credentials and re-pair; do not retry the
old token.

## 4. Bootstrap

```http
GET /api/v1/desktop/bootstrap
Authorization: Bearer <desktop_access_token>
```

Bootstrap is the canonical startup read. It verifies live user/session/device,
active memberships/workspaces, commercial resolution, usage, and compatibility.
It returns:

- API version and server time
- safe user and registered device
- active workspaces and server-resolved roles/permissions
- current workspace
- pinned subscription summary and resolution source
- boolean/numeric/string entitlements with cache timestamps
- all eight usage metrics and limits
- all 12 resolved capability keys
- compatibility decision
- bootstrap/offline policy

It does **not** return feature flags, provider billing identifiers, BYOK data, token
material, local project state, prompts, model selection, or telemetry records.

Use the exact `DesktopBootstrapV1` in
[desktop-cloud-api-contract.md](./desktop-cloud-api-contract.md). Replace the entire
workspace-scoped projection together after every successful bootstrap; do not merge
new entitlement/capability state into a stale workspace object.

## 5. Workspace Selection

```http
GET /api/v1/desktop/workspaces
Authorization: Bearer <desktop_access_token>
```

Returns active workspaces backed by active membership, each with role, permissions,
and current marker. If bootstrap finds that the selected workspace is no longer
available, it safely selects the first remaining active workspace. No workspace
means `WORKSPACE_ACCESS_DENIED`.

```http
POST /api/v1/desktop/workspaces/select
Authorization: Bearer <desktop_access_token>
Content-Type: application/json

{ "workspaceId": "844444444444444444444444" }
```

The ID is a selector, not authority. The server verifies membership,
`workspace.read`, active status, session, and bound device. Success returns a complete
bootstrap; replace current workspace, subscription, entitlements, usage,
capabilities, compatibility, and policy atomically in client state.

Do not submit role or permissions. Clear workspace-scoped caches after a selection
failure, removed membership, or suspended/archived workspace.

## 6. Capabilities

Every bootstrap includes exactly these keys:

| Capability | Current readiness | Additional rule |
| --- | --- | --- |
| `presentation_studio` | Ready | `workspace.read` |
| `local_generation` | Ready | `local_generation` entitlement |
| `byok_generation` | Ready | No Cloud entitlement; BYOK remains local |
| `pptx_export` | Ready | `pptx_export` entitlement + `deck.read` |
| `cloud_generation` | Planned | Returned `not_production_ready` |
| `agent_studio` | Planned | Returned `not_production_ready` |
| `agent_catalog` | Planned | Returned `not_production_ready` |
| `local_agent_execution` | Planned | Returned `not_production_ready` |
| `cloud_agent_execution` | Planned | Returned `not_production_ready` |
| `local_model_management` | Planned | Returned `not_production_ready` |
| `cloud_asset_sync` | Planned | Returned `not_production_ready` |
| `cloud_project_sync` | Planned | Returned `not_production_ready` |

Render `available` and its machine reason. Do not recreate the resolver, hardcode
plan names, enable planned features from local code presence, or treat capability
display as authorization for a Cloud API. A mandatory update disables every key.

## 7. Compatibility

| Code | Required client behavior |
| --- | --- |
| `compatible` | Continue |
| `update_recommended` | Show dismissible update prompt |
| `update_required` | Block capability use and require update |
| `version_blocked` | Block capability use and require update |
| `version_invalid` | Treat build metadata as invalid; require update |

Policies use semantic versions and exact release channels. Exact platform policy
wins, then `all`; missing policy means compatible. Use server `downloadUrl` only
after normal external-URL validation. Do not construct release URLs locally.

`updateRequired=true` is authoritative for the capability response. Do not bypass a
mandatory update based on cached plan, local flags, or user preference.

## 8. Offline Policy

Bootstrap supplies `bootstrapExpiresAt`, `offlineGraceExpiresAt`, cache/grace seconds,
cacheable/online-required field names, and fixed safety declarations.

Within the local-only grace boundary, Desktop may show cached identity/workspace
labels, keep local projects accessible, and use cached capabilities for eligible
local-only product behavior. It must clearly mark state stale.

Always require online revalidation for:

- Cloud generation/jobs and Cloud project/asset access
- workspace switching
- session refresh and device management
- subscription, entitlement, usage, or billing changes
- plan upgrades or restored memberships

`cloudOperationsAllowedOffline` is always false. Offline grace is not an access-token
extension. After grace expiry, preserve local projects but disable entitlement-
dependent behavior until successful bootstrap.

An offline client cannot learn revocation immediately. On next
`DEVICE_REVOKED`, `DEVICE_BLOCKED`, `SESSION_REVOKED`, or `REFRESH_TOKEN_REUSED`:

1. Stop Cloud requests.
2. Clear access token memory and refresh token secure storage.
3. Clear sensitive Cloud response caches.
4. Preserve local projects and local encryption metadata.
5. Require pairing for future Cloud access.

## 9. Desktop Error Handling

| Code | Retry | Desktop behavior |
| --- | --- | --- |
| `PAIRING_PENDING` | Poll later | Honor poll interval |
| `PAIRING_DENIED` | No | Stop and show denial |
| `PAIRING_EXPIRED`, `PAIRING_ALREADY_USED`, `PAIRING_NOT_FOUND` | No | Clear pairing and restart |
| `PAIRING_RATE_LIMITED`, `RATE_LIMITED` | Delayed | Honor backoff; stop aggressive polling |
| `DEVICE_ALREADY_REGISTERED` | No | Account/security guidance |
| `DEVICE_REVOKED`, `DEVICE_BLOCKED`, `DEVICE_NOT_FOUND` | No | Clear Cloud credentials; re-pair/support |
| `SESSION_EXPIRED`, `SESSION_REVOKED`, `REFRESH_TOKEN_REUSED` | No old-token retry | Clear credentials; re-pair |
| `WORKSPACE_SUSPENDED`, `WORKSPACE_ACCESS_DENIED`, `FORBIDDEN` | After state change | Refresh workspace selection/support |
| `API_VERSION_UNSUPPORTED` | No | Use supported API/build |
| `DESKTOP_API_DISABLED` | Bounded | Service unavailable UX |
| `INVALID_REQUEST` | After correction | Client bug/input correction |
| `AUTH_ACCOUNT_SUSPENDED` / `AUTH_EMAIL_NOT_VERIFIED` | No | Stop refresh and send the user through account recovery |
| `INTERNAL` / `INTERNAL_ERROR` | Bounded | Report request ID only |

Branch on `error.code`, not message text. Retry only when `retryable=true`, except
`PAIRING_PENDING`, whose HTTP 409 is an expected protocol state.

## 10. Desktop Security Rules

Desktop must never log credentials, trust cached paid access indefinitely, grant
itself roles/permissions/capabilities, submit plan/entitlement/usage state, bypass
mandatory updates, treat offline grace as Cloud authorization, derive installation
identity from hardware, or send BYOK credentials through PR28 APIs.

Always escape server-returned display metadata, serialize refresh, use request IDs
without secrets in support reports, enforce workspace cache isolation, and preserve
local projects during Cloud revocation.

## Integration Checklist

- [ ] Random installation identity stored in protected application storage
- [ ] Pairing secret and query redaction verified in all diagnostics
- [ ] Poll interval and transaction terminal states implemented
- [ ] Single exchange and secure refresh-token persistence implemented
- [ ] Refresh operations serialized; reuse clears credentials
- [ ] Bootstrap strict decoder and atomic state replacement implemented
- [ ] Workspace switch replaces all workspace-scoped state
- [ ] Capability and compatibility reasons drive UI
- [ ] Offline grace never permits Cloud operations
- [ ] OS secure storage tested on macOS, Windows, and Linux targets
- [ ] Revocation preserves local projects and separate BYOK credentials
- [ ] Error/support telemetry excludes tokens, codes, secrets, and installation IDs
