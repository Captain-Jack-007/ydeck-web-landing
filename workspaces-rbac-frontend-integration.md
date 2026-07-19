# YDeck Workspace and RBAC Frontend Integration

## Overview

YDeck clients authenticate a user first, then resolve the workspace in which that user is operating. A successful login does not by itself grant access to every workspace or resource.

The frontend uses workspace membership and the server-returned permission list to present appropriate workflows. The backend remains authoritative for every operation.

## Authentication Relationship

```text
Login
  |
  v
Load current user
  |
  v
Load workspaces
  |
  v
Resolve or select workspace
  |
  v
Load current permissions
  |
  v
Load workspace resources
```

Authentication is provided by the PR24 live session. Workspace selection is stored on that server-side session, not permanently embedded in an access token. After login or token refresh, resolve workspace state from the API rather than deriving it from token contents.

## Workspace State

A client-side context can use the following shape, adapted to the frontend's data layer:

```ts
interface WorkspaceContext {
  workspaceId: string;
  workspace: Workspace;
  membership: WorkspaceMembership;
  permissions: WorkspacePermission[];
}
```

Also model explicit lifecycle states such as `loading`, `ready`, `empty`, and `error`. Do not render workspace resources while an old workspace is visible and a switch is still resolving.

Permissions are session and membership-derived data. Keep them in memory or the normal query cache, invalidate them after workspace selection or a membership change, and refresh them from the server. Do not persist them as a long-lived authorization decision.

## Workspace APIs

Use the canonical `/api/v1/workspaces` routes. Every route requires an authenticated PR24 session.

### List workspaces

```http
GET /api/v1/workspaces
```

Returns workspaces for the caller's active memberships. Each entry includes workspace identity and status, the caller's role and permissions, and compatibility plan/subscription information. Use it for the switcher and initial workspace discovery; do not treat returned plan fields as a future entitlement decision.

### Resolve the current workspace

```http
GET /api/v1/workspaces/current
```

Returns `workspace`, `membership`, and `permissions`. The server uses the live session's active workspace when valid and may recover to another active membership if the stored selection is stale. Use this endpoint to hydrate the active workspace after authentication and on a full application reload.

### Create a workspace

```http
POST /api/v1/workspaces
Content-Type: application/json

{
  "name": "Design Team",
  "slug": "design-team"
}
```

`name` is required and `slug` is optional. Creation produces an organization workspace and an owner membership for the authenticated user. The response is the created workspace. Invitations, team billing, and enterprise policy are not part of this operation.

### Select a workspace

```http
POST /api/v1/workspaces/:workspaceId/select
```

The server verifies active membership, stores the selection on the live session, and returns `workspace`, `membership`, and `permissions`. Use only an ID returned from workspace discovery, but still handle rejection because membership may have changed.

### Read a workspace

```http
GET /api/v1/workspaces/:workspaceId
```

Requires `workspace.read`. The response includes the workspace, caller role and permissions, and current branding, preferences, and compatibility subscription data. Use it for workspace settings and detail views.

### Update a workspace

```http
PATCH /api/v1/workspaces/:workspaceId
Content-Type: application/json

{
  "name": "New Workspace Name",
  "slug": "new-workspace-name"
}
```

Requires `workspace.update`. Only `name` and `slug` are accepted by PR25; `slug` may be cleared with `null`. Do not send status, owner, role, plan, or billing changes through this endpoint.

### List members

```http
GET /api/v1/workspaces/:workspaceId/members
```

Requires `member.read`. Returns active membership records with safe user identity data, membership role and status, and membership timestamps. Use it for member display and role-aware UI. It is not an invitation list.

PR25 also provides permission-protected direct member add, role update, and removal routes for existing users. They are workspace RBAC operations, not admin overrides, and do not implement email invitations.

## Workspace Switching

A user may see, for example:

```text
Personal Workspace
Company Workspace
Client Workspace
```

On switch:

1. Disable workspace-dependent mutations.
2. Call `POST /api/v1/workspaces/:workspaceId/select`.
3. Replace the workspace, membership, and permissions atomically from the response.
4. Invalidate all workspace-scoped resource queries and realtime subscriptions.
5. Load resources for the new context.

Do not change only a local workspace ID. Do not keep permissions from the prior workspace. A workspace ID in a URL is navigation input, not evidence of access; let the server validate it and show a safe not-authorized state when rejected.

## Membership Display

Display the role returned for the current membership:

```text
owner
admin
member
viewer
```

Do not infer a role from resource ownership or the user's global identity. Membership status may change while a session is active, so member and settings screens should refresh after mutations and on authorization failures.

The `invited` persistence status exists for future work, but no invitation flow is implemented. Frontends should not expose invitation acceptance or pending-invite experiences against PR25.

## Permission Handling

Use exact server-returned capabilities for visibility and affordances:

```ts
const canCreateDeck = permissions.includes("deck.create");
```

Typical capabilities include `workspace.read`, `workspace.update`, `member.read`, `member.add`, `deck.create`, `deck.read`, `asset.read`, and `asset.create`. Use the exported/shared contract where available rather than maintaining a divergent frontend role matrix.

Permission-aware UI improves clarity, but it is not authorization. A hidden button does not protect an API. Always handle a server denial caused by a role change, membership removal, workspace suspension, or stale client state.

## Resource Requests

Workspace-scoped resources follow this model:

```text
Current workspace
    |
    v
Request a deck, job, or asset
    |
    v
Server derives or receives resource workspace
    |
    v
Server validates membership and capability
    |
    v
Authorized resource response
```

Include a workspace identifier only where the actual endpoint contract requires one. Do not invent a workspace header or add an ID to arbitrary payloads. Resource-by-ID APIs derive the tenant from the stored resource and must still reject cross-workspace access.

After a switch, clear cached deck, job, asset, branding, preference, and member data from the previous workspace. Reconnect or resubscribe realtime channels only after the new context succeeds.

## Frontend State Management

Recommended boundaries:

- Keep authentication state separate from workspace state.
- Key workspace-scoped query caches by `workspaceId`.
- Hydrate the current workspace with `/current` after session restoration.
- Use the list endpoint for switcher choices and `/select` for the authoritative change.
- Replace membership and permissions together to avoid mixed-workspace UI.
- Clear workspace data on logout and when authentication becomes invalid.
- Treat an empty workspace list as a recoverable account-provisioning or support state, not as permission to create local tenant state.

Avoid storing permissions, role decisions, or workspace status permanently in local storage. A desktop cache may remember the last displayed workspace ID as a convenience, but `/current` or `/select` must revalidate it.

## UI Rules

- Hide or disable actions the returned permissions do not allow.
- Explain read-only state for viewers without implying an application error.
- Block new resource controls when the server reports a suspended or archived workspace.
- Preserve access to safe read views when the backend permits them.
- Do not offer ownership transfer, workspace suspension, invitations, billing, or deletion as implemented PR25 features.
- Show a workspace switch as an application-context change, including loading and failure states.
- Never display legacy plan fields as authoritative entitlement badges.

## Error Handling

Use HTTP status and the API's standard error payload rather than matching error-message prose:

- `401`: authentication is missing, expired, or revoked; run the normal session recovery or login flow.
- `403`: active membership, permission, or workspace status does not allow the operation; refresh workspace state and explain the denied action.
- `404`: the requested workspace or resource is unavailable; do not reveal cross-tenant existence.
- `409`: the mutation conflicts with current state, including protected last-owner operations or uniqueness constraints; reload before retrying.
- `400`: request validation failed; keep the user's input and display field-level guidance where available.

Do not automatically retry authorization failures. A membership or workspace-status change requires refreshed state or user action, not a retry loop.

## Future Plans Integration

Future access will be composed as:

```text
Workspace
    |
    v
Subscription
    |
    v
Plan and entitlements
    |
    v
Feature access
```

Do not hardcode user-level plan checks such as:

```js
if (user.isPro) {
  // ...
}
```

Keep authentication, workspace membership, RBAC permissions, and future entitlements as distinct state. A user may have different access in different workspaces.

## Desktop Considerations

```text
Desktop login
    |
    v
User session restoration
    |
    v
Workspace resolution or selection
    |
    v
Workspace-scoped generation and resource APIs
```

Store PR24 session credentials only in operating-system secure storage. Do not encode active workspace or permissions into desktop credentials. On startup, restore authentication, call the workspace APIs, and refresh tenant data before enabling generation.

When switching workspaces, cancel or detach workspace-specific polling and realtime subscriptions, clear tenant caches, and resubscribe after server confirmation. Offline views must be visibly stale and must not authorize queued mutations from cached permissions.
