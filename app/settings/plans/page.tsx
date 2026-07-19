"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, Button, EmptyState, Panel, SettingsHeader, SkeletonBlock, StatusBadge, WorkspaceRequiredState } from "@/components/account/ui";
import { getHumanErrorMessage } from "@/src/api/client";
import { formatCurrencyMinor } from "@/src/lib/format";
import { useBilling } from "@/src/providers/billing-provider";
import { useWorkspace } from "@/src/providers/workspace-provider";

export default function PlansPage() {
  const { workspace } = useWorkspace();
  const { plans, plansStatus, plansError, checkout, summary, summaryStatus, refreshBilling, refreshPlans } = useBilling();
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function formatEntitlementName(value: string) {
    return value.replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function formatPurchaseMode(value: string) {
    if (value === "contact_sales") return "Contact sales";
    if (value === "self_service") return "Self-service";
    return formatEntitlementName(value);
  }

  return (
    <>
      <SettingsHeader
        title="Plans"
        description="Compare available workspace plans and start checkout when your role allows billing changes."
        scope="Workspace"
      />
      {actionError ? <Alert tone="danger">{actionError}</Alert> : null}
      {!workspace ? (
        <WorkspaceRequiredState
          title="Select a workspace to compare plans"
          description="Plan eligibility, checkout, and billing permissions depend on the selected workspace."
        />
      ) : (
      <Panel title="Available plans" description="Plan availability and checkout permissions are scoped to the selected workspace.">
        {plansStatus === "loading" || plansStatus === "idle" ? (
          <SkeletonBlock rows={4} />
        ) : plansStatus === "error" ? (
          <EmptyState
            title="Plan catalog unavailable"
            action={<Button type="button" variant="secondary" onClick={() => void refreshPlans()}>Retry catalog</Button>}
          >
            {plansError ?? "YDeck could not load the current plan catalog."}
          </EmptyState>
        ) : plans.length === 0 ? (
          <EmptyState title="No purchasable plans are available">
            The current catalog has no plans available for this environment. Your existing workspace access is unchanged.
          </EmptyState>
        ) : (
          <div className="plan-grid">
            {plans.map((plan) => {
              const offers = (plan.offers ?? []).filter(
                (item) => item.billingInterval === "monthly" || item.billingInterval === "annual",
              );
              const current = summary?.subscription?.planKey === plan.key;
              const capabilities = Object.entries(plan.entitlements?.booleans ?? {})
                .filter(([, enabled]) => enabled)
                .map(([name]) => formatEntitlementName(name));
              const limits = Object.entries(plan.entitlements?.limits ?? {}).map(
                ([name, limit]) => `${formatEntitlementName(name)}: ${limit == null ? "Unlimited" : limit}`,
              );
              const entitlementDetails = [...capabilities, ...limits].slice(0, 5);
              return (
                <article className={`plan-card${current ? " plan-card--current" : ""}`} key={plan.key} aria-current={current ? "true" : undefined}>
                  <div className="plan-card__header">
                    <div>
                      <h3>{plan.name ?? plan.planName ?? plan.key}</h3>
                      <small className="account-meta">{plan.label ?? formatPurchaseMode(plan.purchaseMode)}</small>
                    </div>
                    <StatusBadge tone={current ? "success" : plan.purchaseMode === "contact_sales" ? "warning" : "neutral"}>
                      {current ? "Current plan" : formatPurchaseMode(plan.purchaseMode)}
                    </StatusBadge>
                  </div>
                  {offers.length ? (
                    <div className="plan-offers">
                      {offers.map((offer) => (
                        <div key={`${plan.key}-${offer.billingInterval}`}>
                          <strong>{formatCurrencyMinor(offer.amountMinor, offer.currency)}</strong>
                          <small>{offer.label ?? `per ${offer.billingInterval === "annual" ? "year" : "month"}`}</small>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="plan-price">{plan.purchaseMode === "free" ? "Free" : "Custom pricing"}</div>
                  )}
                  {entitlementDetails.length ? (
                    <ul className="plan-entitlements">
                      {entitlementDetails.map((entitlement, entitlementIndex) => (
                        <li key={`${entitlement}-${entitlementIndex}`}>{entitlement}</li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="plan-card__actions">
                    {!current && plan.purchaseMode === "self_service" && summary?.availableActions?.canCheckout
                      ? offers.map((offer) => {
                          const actionKey = `${plan.key}:${offer.billingInterval}`;
                          return (
                            <Button
                              key={actionKey}
                              loading={busyPlan === actionKey}
                              type="button"
                              variant="secondary"
                              disabled={busyPlan !== null}
                              onClick={async () => {
                                setBusyPlan(actionKey);
                                setActionError(null);
                                try {
                                  await checkout(plan.key, offer.billingInterval === "annual" ? "annual" : "monthly");
                                } catch (checkoutError) {
                                  setActionError(getHumanErrorMessage(checkoutError));
                                } finally {
                                  setBusyPlan(null);
                                }
                              }}
                            >
                              Choose {offer.billingInterval}
                            </Button>
                          );
                        })
                      : null}
                    {!current && plan.purchaseMode === "self_service" && !summary?.availableActions?.canCheckout ? (
                      summaryStatus === "loading" || summaryStatus === "idle" ? (
                        <span className="account-meta">Checking workspace billing permissions…</span>
                      ) : summaryStatus === "error" ? (
                        <div className="plan-card__recovery">
                          <span className="account-meta">Workspace billing permissions are temporarily unavailable.</span>
                          <Button type="button" variant="ghost" onClick={() => void refreshBilling()}>Retry</Button>
                        </div>
                      ) : summary?.availableActions?.canOpenPortal ? (
                        <Link className="account-link" href="/settings/billing">Use billing portal</Link>
                      ) : (
                        <span className="account-meta">Your workspace role cannot start checkout.</span>
                      )
                    ) : null}
                    {!current && plan.purchaseMode === "contact_sales" ? (
                      <span className="account-meta">Contact-assisted purchasing is required. A sales contact workflow is not configured in this client.</span>
                    ) : null}
                    {current ? <span className="account-meta">This is the active workspace plan and cannot be selected again.</span> : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Panel>
      )}
    </>
  );
}
