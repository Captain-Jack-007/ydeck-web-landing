# Frontend Billing Integration

## 1. Purpose and Scope

PR 27 provides workspace-owned provider billing on top of PR 24 authentication, PR 25 workspace RBAC, and PR 26 entitlements and usage. The backend owns customer creation, price resolution, provider calls, webhook verification, subscription normalization, entitlement resolution, usage aggregation, and authorization.

The frontend owns pricing and billing screens, confirmation UX, provider redirects, loading/error states, bounded refresh after provider returns, and rendering the server DTOs.

> The frontend must never grant paid access based on a redirect, URL parameter,
> checkout-session creation, provider page result, or locally cached plan key.

PR 27 does not implement taxes, coupons, discounts, refunds, payment-method UI, a checkout-status endpoint, a client polling schedule, or a frontend application in this repository.

## 2. Frontend Billing Architecture

```text
Pricing page
  -> GET public plan catalog
  -> user selects workspace, plan, and interval
  -> POST checkout
  -> provider-hosted checkout
  -> return to YDeck (not proof of payment)
  -> refresh workspace billing summary
  -> verified webhook updates subscription
  -> canonical entitlement resolver updates access
  -> frontend renders confirmed state
```

Keep these states separate:

- **Billing state:** whether provider operations are enabled and a workspace billing customer exists.
- **Subscription state:** normalized provider contract lifecycle for the workspace.
- **Payment state:** a presentation-oriented value derived from subscription state plus last paid invoice data.
- **Entitlement state:** the canonical plan-version features, limits, and values used by product enforcement.
- **Usage state:** ledger-derived consumption for the current UTC usage period.

Checkout creation only creates a provider session. A return page only proves navigation. Product access changes only after the backend resolves an effective subscription and its entitlements.

## 3. Frontend API Matrix

| Purpose | Method | Route | Authentication | Permission | HTTP cache |
| --- | --- | --- | --- | --- | --- |
| Public catalog | GET | `/api/v1/plans` | None | None | `public, max-age=300` |
| Billing summary | GET | `/api/v1/workspaces/:workspaceId/billing` | User session | `billing.read` | `private, no-store` |
| Checkout | POST | `/api/v1/billing/checkout` | User session | `billing.manage` | None declared |
| Customer portal | POST | `/api/v1/billing/portal` | User session | `billing.manage` | None declared |
| Immediate plan change | POST | `/api/v1/billing/subscription/change-plan` | User session | `billing.manage` | None declared |
| Cancel | POST | `/api/v1/billing/subscription/cancel` | User session | `billing.manage` | None declared |
| Reactivate | POST | `/api/v1/billing/subscription/reactivate` | User session | `billing.manage` | None declared |
| Invoice history | GET | `/api/v1/workspaces/:workspaceId/billing/invoices` | User session | `billing.manage` | `private, no-store` |

All mutation bodies are strict. Owners and workspace admins have `billing.manage`; members and viewers have `billing.read` only. Live membership and workspace status are checked server-side.

### Public Plan Catalog

```http
GET /api/v1/plans
```

Response: `PublicPlan[]` from the contracts section. The endpoint returns active, effective, non-internal plan versions. A paid plan is omitted when it lacks an active price mapping in the configured provider environment. Enterprise may appear as `contact_sales` without an offer. Plans are sorted by key, not marketing priority.

Loading: render a stable pricing skeleton. Empty/error: do not substitute a hardcoded catalog; offer retry and support/contact navigation. GET retry is safe.

### Workspace Billing Summary

```http
GET /api/v1/workspaces/:workspaceId/billing
Authorization: Bearer <access_token>
```

Response: `WorkspaceBillingSummary`. Load it after workspace selection, after every billing mutation, and after checkout/portal return. Missing nullable dates or currency mean the backend has no corresponding provider/invoice evidence; do not fabricate them.

### Checkout

```ts
interface CreateCheckoutRequest {
  workspaceId: string;
  planKey: string;
  billingInterval: "monthly" | "annual";
  successReturnPath: string;
  cancelReturnPath: string;
  idempotencyKey: string;
}
```

`idempotencyKey` is 16-160 characters matching `[A-Za-z0-9._:-]+`. Return values are `checkoutSessionId`, server-created `checkoutUrl`, and nullable `expiresAt`.

Disable duplicate submission. Reuse the same idempotency key for a retry of the same user intent. Do not automatically generate a new key after an ambiguous response. Navigate only to the returned URL. A `201` response does not activate a plan.

### Customer Portal

```ts
interface PortalRequest { workspaceId: string; returnPath: string }
interface PortalResponse { portalUrl: string; expiresAt: string | null }
```

The workspace must already have an active provider customer. Disable duplicate submission, navigate only to the returned URL, and refresh summary and invoices after return.

### Change Plan

```ts
interface ChangePlanRequest {
  workspaceId: string;
  planKey: string;
  billingInterval: "monthly" | "annual";
  changeTiming?: "immediate" | "period_end";
}
```

Only `immediate` is implemented. It calls the provider with proration and applies the returned normalized snapshot. `period_end` is rejected with `SUBSCRIPTION_CHANGE_NOT_ALLOWED`; direct users to the provider portal when `canOpenPortal` is true. Success is `{ ok: true }`; refresh summary, entitlements, usage, and invoices.

### Cancel

```ts
interface CancelSubscriptionRequest {
  workspaceId: string;
  timing?: "period_end" | "immediate";
  reason?: string;
}
```

Default timing is `period_end`. A repeated period-end request is domain-idempotent when cancellation is already scheduled. Immediate cancellation is rejected unless server policy enables it. Require confirmation showing `cancellationEffectiveAt` or current period end when available. Success is `{ ok: true }`; refresh the summary.

### Reactivate

```ts
interface ReactivateSubscriptionRequest { workspaceId: string }
```

Reactivation only clears a recoverable `cancelAtPeriodEnd` provider state. It cannot restore an ended subscription or create a new one. Success is `{ ok: true }`; refresh the summary.

### Invoice History

```http
GET /api/v1/workspaces/:workspaceId/billing/invoices?page=1&limit=25
```

`page` is 1-10,000 and `limit` is 1-100. The response is `Page<PublicInvoice>`. Amounts are integer minor units. Only open HTTPS hosted/PDF URLs returned by the backend, using `noopener,noreferrer`. Provider invoice identifiers are omitted.

## 4. Public Plan Catalog

The catalog has no description or locale field. `label` is the only optional provider-configured offer label. The frontend formats `amountMinor` with the supplied three-letter `currency` and selected locale; never divide by a hardcoded currency precision rule for all currencies.

| Seed plan | Actual visibility rule |
| --- | --- |
| Free | Returned when active with an effective version; `purchaseMode=free` |
| Teacher | Paid; returned only with at least one active current-environment offer |
| Pro | Paid; returned only with at least one active current-environment offer |
| Team | Paid; returned only with at least one active current-environment offer |
| Enterprise | Returned as `contact_sales`; no self-service checkout |
| Internal Beta | Excluded because internal plans are filtered out |

Offers may include `custom`, but checkout accepts only `monthly` or `annual`. Hide unsupported intervals from self-service controls. Do not hardcode provider product or price IDs. Cache the catalog according to its five-minute response header and refetch before checkout if stale.

`GET /api/v1/billing/plans` exists only as a simplified compatibility read. It lacks prices, purchase mode, plan versions, and entitlements and does not implement the canonical public-catalog visibility rules. New pricing UI must not use it.

## 5. Workspace Billing Summary

- `canManageBilling`: caller has `billing.manage`; it does not imply billing is enabled or that a particular action is valid.
- `availableActions`: final server-computed UI eligibility after permission, billing configuration, provider ownership, and lifecycle state.
- `subscription.planKey/planVersionId/planName`: canonical entitlement resolution, including Free fallback.
- `providerManaged`: a provider subscription reference exists; provider identifiers are not exposed.
- `status`: normalized subscription lifecycle.
- `payment`: UI summary, not a payment ledger.
- `entitlements`: feature/limit/value authority for presentation; product APIs still enforce independently.
- `usage`: UTC ledger aggregates. `limit=null` and `remaining=null` mean no configured limit.

Action meanings:

| Field | True when |
| --- | --- |
| `canCheckout` | manager, billing enabled, no provider-managed subscription |
| `canUpgrade` | manager, billing enabled, provider-managed active/trialing subscription |
| `canDowngrade` | same backend predicate as upgrade; target validation happens on mutation |
| `canCancel` | manageable provider subscription not already ending/ended |
| `canReactivate` | manageable provider subscription scheduled to cancel but not ended |
| `canOpenPortal` | manager, billing enabled, provider-managed subscription |

Render only actions returned true. A subsequent request can still fail if state changed concurrently.

## 6. Frontend Billing State Machine

Frontend transient states such as `checkout_pending` and `provider_processing` are local UI states, not API subscription enums.

| Backend state | Meaning | Paid access policy | Primary UI | Typical actions |
| --- | --- | --- | --- | --- |
| `free` | No provider-managed effective contract | Free | Pricing/checkout | Checkout if allowed |
| `trialing` | Provider trial | Pinned plan | Trial end and usage | Change, cancel, portal |
| `incomplete` | Initial payment/action incomplete | Free fallback | Payment action banner | Portal |
| `incomplete_expired` | Incomplete setup expired | Free fallback | Restart guidance | Portal/support; checkout may remain false while provider-managed |
| `active` | Provider contract active | Pinned plan | Normal billing settings | Change, cancel, portal |
| `past_due` | Payment overdue | Until configured grace boundary; default zero days | Persistent warning | Portal |
| `unpaid` | Provider marked unpaid | Free fallback | Blocking payment banner | Portal |
| `paused` | Provider paused collection/access | Free fallback | Paused warning | Portal |
| `cancelled` | Provider canceled | Only until stored effective end, otherwise Free fallback | Ended/canceling detail | None or portal depending server action flags |
| `expired` | Contract ended | Free fallback | Expired state | None or portal depending server action flags |

`cancelAtPeriodEnd=true` is a flag, not a status. The provider status normally remains `active` or `trialing`, and paid access continues until cancellation becomes effective.

Transitions are provider/webhook driven except for user requests that call provider operations. A verified subscription event, invoice recovery/failure re-fetch, or reconciliation may change normalized state. The return page never does.

## 7. Required Frontend Screens

### Pricing Page

Load the catalog, group only returned offers, format currency, show current plan from billing summary, and disable self-service checkout for `contact_sales`. Workspace selection is required before checkout. Internal Beta must never come from local constants. The backend provides no marketing ordering or localization.

### Workspace Billing Settings

Render the canonical plan/version, lifecycle badge, dates, payment state, entitlements, usage, and server actions. Users with `billing.read` but not `billing.manage` receive a complete read-only summary and a permission explanation.

### Checkout Return Page

Success and cancellation paths are client-chosen paths restricted by server allow-listed origins. Neither path proves payment. Refresh summary immediately, then use bounded client polling with backoff only while showing `provider_processing`. No polling interval or timeout is defined by the backend. On timeout, retain Free/current confirmed access and provide support guidance.

### Usage and Limits

Show `used`, nullable `limit`, nullable `remaining`, and UTC period dates. Near-limit thresholds are a frontend presentation decision. When exhausted, rely on product API enforcement and show an upgrade CTA only when a server action permits it.

### Payment Failure Banner

Show non-dismissible workspace state for `past_due`, `unpaid`, `incomplete`, or payment `failed`. Only billing managers receive a portal action. Read-only members still need status visibility but cannot repair billing.

### Cancellation and Reactivation

Confirm timing and effective date before cancel. Disable the control while pending. Reactivation appears only when `canReactivate`. Always refetch after success or a `409` state conflict.

### Invoice History

Billing managers receive paginated normalized invoices. Show an empty state when `items=[]`. Format minor-unit amounts by currency, show status/date, and render hosted/PDF links only when non-null.

## 8. Frontend Security Rules

The frontend must never submit or trust roles, permissions, entitlements, usage, subscription/payment status, provider customer/subscription/price IDs, arbitrary return origins, local plan authority, or a constructed provider URL. It must never expose hidden/internal plans or treat checkout creation/return as payment.

The frontend must refresh billing state after mutations and provider returns, disable duplicate submissions, retain request IDs for support, respect `availableActions`, handle delayed webhooks, and treat backend entitlements as authoritative.

## 9. Frontend Cache and Refresh Rules

Only catalog and billing read routes declare cache policy. Other durations below are frontend recommendations, not backend guarantees.

| Data | May cache? | Recommendation | Invalidate when |
| --- | --- | --- | --- |
| Public plans | Yes | Honor `max-age=300` | Stale checkout entry, explicit refresh |
| Billing summary | Memory only | Treat as immediately revalidatable | Login/logout, workspace switch, focus after provider return, every mutation |
| Entitlements/usage in summary | Memory only | Same query lifetime as summary | Plan/status change, product limit error, workspace switch |
| Invoices | Memory only | No-store response | Portal return, payment recovery/failure, pagination change |
| Mutation results | No | N/A | Invalidate summary, entitlements, usage, invoices |

On reconnect or browser focus, refetch if the user is on checkout return, billing settings, or a payment-warning surface. Stop polling after a bounded client-defined window.

## 10. Frontend Error Mapping

| Code | Category | Retry? | UI action |
| --- | --- | --- | --- |
| `BILLING_DISABLED`, `BILLING_NOT_CONFIGURED` | Configuration | No | Disable mutations; support message |
| `BILLING_PERMISSION_DENIED` | Permission | No | Read-only view; contact owner/admin |
| `PLAN_NOT_FOUND`, `PLAN_NOT_PURCHASABLE`, `PLAN_VERSION_NOT_FOUND`, `PLAN_VERSION_ARCHIVED`, `PLAN_INTERVAL_UNSUPPORTED` | Offer | Refetch catalog | Remove invalid selection |
| `BILLING_PRICE_MAPPING_NOT_FOUND`, `BILLING_ENVIRONMENT_MISMATCH` | Configuration | No blind retry | Support/operations |
| `BILLING_CUSTOMER_NOT_FOUND`, `BILLING_CUSTOMER_CONFLICT` | Account state | Usually no | Refresh; support if persistent |
| `CHECKOUT_ALREADY_IN_PROGRESS` | Idempotency/conflict | No new key | Refresh and resume/await current intent |
| `ACTIVE_SUBSCRIPTION_EXISTS` | State conflict | No | Open current billing settings |
| `INVALID_RETURN_URL` | Client configuration | No | Engineering fix |
| `SUBSCRIPTION_NOT_FOUND`, `SUBSCRIPTION_ALREADY_CANCELED` | State | Refetch | Update controls |
| `SUBSCRIPTION_CHANGE_NOT_ALLOWED`, `SUBSCRIPTION_REACTIVATION_NOT_ALLOWED`, `SUBSCRIPTION_STATE_CONFLICT` | State conflict | Refetch first | Use portal/current state |
| `PAYMENT_ACTION_REQUIRED`, `PAYMENT_FAILED`, `SUBSCRIPTION_PAST_DUE`, `SUBSCRIPTION_UNPAID` | Payment | No blind retry | Payment banner/portal |
| `RECONCILIATION_REQUIRED`, `RECONCILIATION_FAILED` | Support | No user retry | Contact support |
| `BILLING_PROVIDER_ERROR`, `CHECKOUT_CREATION_FAILED` | Provider | Bounded | Preserve input, retry later |
| `BAD_REQUEST` | Validation | After correction | Field-level error |
| `AUTH_REQUIRED` or HTTP 401 | Session | After re-auth | Session recovery |
| `RATE_LIMITED` or HTTP 429 | Rate limit | Yes, delayed | Honor backoff; keep disabled |
| `INTERNAL` or HTTP 500 | Server | Bounded | Generic failure plus request ID |

## 11. Frontend TypeScript Contracts

Use the public DTOs in [billing-api-contract.md](./billing-api-contract.md): `PublicPlan`, `PlanOffer`, `WorkspaceBillingSummary`, `SubscriptionSummary`, `PaymentSummary`, `EntitlementSummary`, `UsageSummary`, `BillingActions`, mutation requests/responses, `PublicInvoice`, `Page<T>`, and `ApiErrorResponse`. Do not import server database model types.

## 12. Frontend Integration Checklist

- [ ] API client and public DTOs added
- [ ] Catalog and workspace selection integrated
- [ ] Summary and permission-aware controls integrated
- [ ] Checkout return uses confirmed-state refresh
- [ ] Portal, immediate change, cancel, and reactivate flows integrated
- [ ] Invoice pagination and safe external links integrated
- [ ] Payment/usage/limit states implemented
- [ ] Error map and bounded retry implemented
- [ ] Mutation invalidation and workspace cache isolation implemented
- [ ] Internal plans and provider identifiers excluded
- [ ] Security review and end-to-end provider-delay tests completed
