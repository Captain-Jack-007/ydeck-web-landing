# YDeck Desktop Bootstrap Contract

> Backend schema reference. The current cross-client contract is
> [docs/implementation/desktop-cloud-api-contract.md](./implementation/desktop-cloud-api-contract.md).

## Purpose

`GET /api/v1/desktop/bootstrap` is the canonical startup read for an authenticated desktop installation. It validates the live user, desktop session, device, membership, workspace status, subscription, entitlements, usage, and version policy before returning a strict `v1` response.

## Response Shape

```ts
interface DesktopBootstrapV1 {
  apiVersion: "v1";
  serverTime: string;
  user: {
    id: string; name: string; email: string; emailVerified: boolean;
    displayName: string; avatarUrl: string | null; preferredLanguage: string;
    timeZone: string | null; accountStatus: string;
    status: "active" | "restricted" | "deletion_pending";
  };
  device: {
    id: string; publicId: string | null; name?: string; platform: string;
    architecture: string; appVersion?: string; appBuild?: string;
    releaseChannel: "stable" | "beta" | "internal";
    status: "pending" | "active" | "revoked" | "blocked" | "disabled";
    trustLevel: "standard" | "review_required" | "blocked"; lastSeenAt: string;
  };
  workspaces: WorkspaceSummary[];
  currentWorkspace: { id: string; name: string; role: string; permissions: string[] };
  subscription: SubscriptionSummary;
  entitlements: EntitlementSummary;
  usage: UsageSummary[];
  capabilities: Record<DesktopCapabilityKey, DesktopCapabilityState>;
  compatibility: DesktopCompatibility;
  policies: DesktopOfflinePolicy;
}
```

All times are ISO 8601 strings. The response schema is strict and rejects undeclared fields in server tests.

The `user` object is built by the canonical account-profile serializer. `name` remains
as a backward-compatible alias for `displayName`. A deletion-pending Desktop session
may bootstrap so the client can show recovery state, but Cloud product operations are
blocked until deletion is cancelled. Bootstrap does not include the account security
summary, credentials, deletion processor state, or verification secrets.

## Workspaces

Each workspace contains `id`, `name`, optional `slug`, `type`, `role`, `permissions`, and `isCurrent`. Only active memberships and active workspaces are included. If a valid session has no selected workspace, bootstrap selects the first available active workspace server-side. If none exists, bootstrap fails closed.

`POST /api/v1/desktop/workspaces/select` accepts only `{ "workspaceId": "..." }`. The backend verifies membership, `workspace.read`, active workspace status, and the live desktop session, then returns the complete refreshed bootstrap.

## Subscription and Entitlements

Subscription data comes from the canonical version-pinned commercial resolver. It includes `planKey`, `planVersionId`, `status`, `effectiveFrom`, optional `effectiveUntil`, and a resolution `source`. Provider customer, subscription, price, and payment identifiers are not exposed.

Entitlements are split into:

- `booleans`: feature access values
- `limits`: numeric plan limits
- `values`: string-valued configuration
- `resolvedAt` and `expiresAt`: cache boundaries

A missing or inconsistent effective subscription uses the commercial service's fail-closed Free resolution. The desktop must not turn a cached plan label into permission.

## Usage

Usage is generated from the typed server metrics. Each entry includes `metric`, `used`, nullable `limit`, nullable `remaining`, `periodStart`, and `periodEnd`. Aggregates are reads over the usage ledger, not mutable counters supplied by the client.

## Capability Resolution

Each state contains:

```ts
type DesktopCapabilityState = {
  available: boolean;
  reason:
    | "available"
    | "not_production_ready"
    | "server_disabled"
    | "entitlement_required"
    | "permission_required"
    | "desktop_update_required";
  requiredEntitlement?: string;
  requiredPermission?: string;
};
```

Evaluation order is readiness, server availability, mandatory compatibility update, entitlement, and permission. The desktop should render the supplied reason and must not recreate this policy locally.

## Compatibility

Compatibility includes `code`, supported/recommended/latest versions when configured, booleans for required/recommended update, optional block reason, download URL, and message. `version_blocked` and mandatory `update_required` disable every capability. An unknown platform uses only the `all` policy.

## Cache Policy

`policies` contains successful-bootstrap time, bootstrap expiry, offline-grace expiry, cache durations, telemetry policy, cacheable field names, online-required field names, and fixed declarations that cloud operations are unavailable offline, local projects remain accessible, and BYOK credentials are separate.

Subscription, entitlement, and usage state must be revalidated online. A cached response may inform local UX until expiry but cannot authorize a new cloud operation.

## Sensitive-Data Boundary

Bootstrap never includes refresh/access tokens, token hashes, raw installation identifiers, provider secrets, payment identifiers, BYOK keys, local file names, prompts, project content, model names, CLI history, or execution logs.
