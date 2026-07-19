"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarClock, CreditCard, Gauge, ShieldCheck } from "lucide-react";
import { Alert, Button, ConfirmationDialog, EmptyState, Panel, SettingsHeader, SettingsRow, SkeletonBlock, StatusBadge, WorkspaceRequiredState } from "@/components/account/ui";
import { getHumanErrorMessage } from "@/src/api/client";
import { formatCurrencyMinor, formatDateTime } from "@/src/lib/format";
import { useBilling } from "@/src/providers/billing-provider";
import { useWorkspace } from "@/src/providers/workspace-provider";

export default function BillingPage() {
  const { workspace } = useWorkspace();
  const { summary, summaryStatus, summaryError, portal, cancel, reactivate, refreshBilling, refreshInvoices } = useBilling();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [busyAction, setBusyAction] = useState<"portal" | "cancel" | "reactivate" | null>(null);
  const [returnMessage, setReturnMessage] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ tone: "success" | "danger"; message: string } | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const handledReturn = useRef(false);
  const busy = busyAction !== null;
  const formatStatus = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  const formatMetric = (value: string) => value.replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

  useEffect(() => {
    const success = searchParams.get("success") === "true";
    const cancelled = searchParams.get("cancelled") === "true";
    if (!workspace?.id || (!success && !cancelled)) {
      handledReturn.current = false;
      setReturnMessage(null);
      return;
    }
    if (handledReturn.current) {
      return;
    }
    handledReturn.current = true;
    setReturnMessage(success ? "Billing updated." : "Billing checkout cancelled.");
    void (async () => {
      try {
        await Promise.all([refreshBilling(), refreshInvoices(1)]);
        setReturnMessage(success ? "Billing is synchronized with the latest workspace state." : "Checkout was cancelled. Your current plan is unchanged.");
      } catch (refreshError) {
        setActionFeedback({ tone: "danger", message: getHumanErrorMessage(refreshError) });
      } finally {
        router.replace("/settings/billing");
      }
    })();
  }, [refreshBilling, refreshInvoices, router, searchParams, workspace?.id]);

  async function runAction(
    actionName: "portal" | "cancel" | "reactivate",
    action: () => Promise<void>,
    successMessage?: string,
  ) {
    setBusyAction(actionName);
    setActionFeedback(null);
    try {
      await action();
      if (successMessage) {
        setActionFeedback({ tone: "success", message: successMessage });
      }
      return true;
    } catch (error) {
      setActionFeedback({ tone: "danger", message: getHumanErrorMessage(error) });
      return false;
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <>
      <SettingsHeader
        title="Billing"
        description="Review the workspace subscription, payment state, usage, and billing actions available to your role."
        scope="Workspace"
        action={workspace ? <Link className="account-button account-button--secondary" href="/settings/plans">Compare plans</Link> : undefined}
      />
      {returnMessage ? <Alert tone="success">{returnMessage}</Alert> : null}
      {actionFeedback ? <Alert tone={actionFeedback.tone}>{actionFeedback.message}</Alert> : null}
      {!workspace ? (
        <WorkspaceRequiredState
          title="Select a workspace to manage billing"
          description="Billing, usage, invoices, and plan changes are scoped to a workspace. Account-level settings remain available without a workspace."
        />
      ) : (
        <>
      {summary && (["past_due", "unpaid", "incomplete", "incomplete_expired"].includes(summary.subscription.status) || summary.payment?.status === "failed") ? (
        <Alert tone="warning" title="Billing needs attention">
          Payment or subscription setup is incomplete. Workspace access follows the confirmed server entitlement state.
        </Alert>
      ) : null}
      <Panel
        title="Subscription"
        description={`Billing for ${workspace.name}`}
        className="account-panel--feature"
      >
        {summaryStatus === "loading" || summaryStatus === "idle" ? (
          <SkeletonBlock rows={4} />
        ) : summaryStatus === "error" ? (
          <EmptyState
            title="Billing summary unavailable"
            action={<Button type="button" variant="secondary" onClick={() => void refreshBilling()}>Try again</Button>}
          >
            {summaryError ?? "YDeck could not confirm the current subscription and payment state. No billing changes were made."}
          </EmptyState>
        ) : summary ? (
          <div className="billing-console">
            <div className="billing-plan-summary">
              <div>
                <span>Current plan</span>
                <h2>{summary.subscription.planName ?? summary.subscription.planKey}</h2>
                <p>{summary.subscription.billingInterval ? `${formatStatus(summary.subscription.billingInterval)} billing` : "Billing interval not reported"}</p>
              </div>
              <StatusBadge tone={summary.subscription.status}>{formatStatus(summary.subscription.status)}</StatusBadge>
            </div>
            <div className="settings-row-list settings-row-list--embedded">
              <SettingsRow
                icon={<ShieldCheck size={18} />}
                label="Billing permissions"
                value={summary.canManageBilling ? "Management access" : "Read-only access"}
                detail={summary.canManageBilling ? "Your server-authorized workspace role can manage billing." : "Ask a workspace owner or billing administrator to make changes."}
                status={<StatusBadge tone={summary.canManageBilling ? "owner" : "member"}>{summary.canManageBilling ? "Can manage" : "View only"}</StatusBadge>}
              />
              <SettingsRow
                icon={<CreditCard size={18} />}
                label="Payment state"
                value={summary.payment?.status ? formatStatus(summary.payment.status) : "No payment required"}
                detail={summary.payment?.amountDueMinor != null && summary.payment.currency
                  ? `${formatCurrencyMinor(summary.payment.amountDueMinor, summary.payment.currency)} currently due`
                  : summary.payment?.nextPaymentAt
                    ? `Next payment ${formatDateTime(summary.payment.nextPaymentAt)}`
                    : "No upcoming payment was reported."}
                status={<StatusBadge tone={summary.payment?.status === "failed" ? "danger" : summary.payment?.status === "action_required" ? "warning" : "neutral"}>{summary.payment?.status ? formatStatus(summary.payment.status) : "Not required"}</StatusBadge>}
              />
              <SettingsRow
                icon={<CalendarClock size={18} />}
                label={summary.subscription.cancelAtPeriodEnd ? "Access ends" : "Renewal or period end"}
                value={formatDateTime(summary.subscription.cancellationEffectiveAt ?? summary.subscription.currentPeriodEnd ?? summary.subscription.effectiveUntil ?? null)}
                detail={summary.subscription.cancelAtPeriodEnd ? "Cancellation is scheduled at the end of the confirmed billing period." : "The date reported by the current workspace subscription."}
                status={<StatusBadge tone={summary.subscription.cancelAtPeriodEnd ? "warning" : "active"}>{summary.subscription.cancelAtPeriodEnd ? "Cancelling" : "Active"}</StatusBadge>}
              />
            </div>
          </div>
        ) : (
          <EmptyState title="No billing summary">
            Billing data is unavailable for this workspace right now.
          </EmptyState>
        )}
        {summary && Object.values(summary.availableActions).some(Boolean) ? <div className="account-actions account-actions--section">
          {summary?.availableActions?.canOpenPortal ? (
            <Button loading={busyAction === "portal"} type="button" onClick={() => void runAction("portal", portal)} disabled={busy}>
              Open billing portal
            </Button>
          ) : null}
          {summary?.availableActions?.canCancel ? <Button
            variant="secondary"
            type="button"
            onClick={() => setCancelDialogOpen(true)}
            disabled={busy}
          >
            Cancel subscription
          </Button> : null}
          {summary?.availableActions?.canReactivate ? <Button
            variant="secondary"
            loading={busyAction === "reactivate"}
            type="button"
            onClick={() => void runAction("reactivate", reactivate, "The scheduled cancellation was removed.")}
            disabled={busy}
          >
            Reactivate
          </Button> : null}
        </div> : null}
        {!summary?.availableActions?.canOpenPortal && summary ? (
          <div className="account-meta account-meta--section">
            Billing portal access is unavailable for this workspace role.
          </div>
        ) : null}
      </Panel>

      <Panel title="Usage" description="Track current limits and remaining capacity for this workspace.">
        {summaryStatus === "loading" || summaryStatus === "idle" ? (
          <SkeletonBlock rows={3} />
        ) : summary?.usage?.length ? (
          <div className="usage-list">
            {summary.usage.map((item) => (
              <div className="usage-item" key={item.metric}>
                <span className="usage-item__icon" aria-hidden><Gauge size={17} /></span>
                <div className="usage-item__body">
                  <strong>{formatMetric(item.metric)}</strong>
                  <small>
                    {item.limit == null ? `${item.used} used · Unlimited` : `${item.used} of ${item.limit} used`}
                  </small>
                  <span>{item.periodEnd ? `Resets or closes ${formatDateTime(item.periodEnd)}` : "Usage period not reported"}</span>
                </div>
                <StatusBadge tone={item.remaining === 0 ? "danger" : "neutral"}>
                  {item.remaining == null ? "Unlimited" : `${item.remaining} remaining`}
                </StatusBadge>
                {item.limit != null ? (
                  <span className="usage-meter" aria-label={`${item.metric} usage`}>
                    <span style={{ width: `${Math.min(100, Math.max(0, (item.used / item.limit) * 100))}%` }} />
                  </span>
                ) : null}
              </div>
            ))}
            <p className="usage-scope-note">Usage is workspace-scoped and reflects only metrics reported by the Cloud billing service. Local Desktop work is not counted unless the backend reports it here.</p>
          </div>
        ) : (
          <EmptyState title="No usage data">
            Usage will appear here when this workspace starts consuming metered features.
          </EmptyState>
        )}
      </Panel>
      <ConfirmationDialog
        open={cancelDialogOpen}
        title="Cancel subscription?"
        description="Cancellation is scheduled according to the current workspace subscription period."
        confirmLabel="Cancel subscription"
        confirmVariant="danger"
        loading={busyAction === "cancel"}
        onCancel={() => setCancelDialogOpen(false)}
        onConfirm={() => {
          void (async () => {
            const cancelled = await runAction("cancel", cancel, "Cancellation is scheduled according to the current subscription period.");
            if (cancelled) {
              setCancelDialogOpen(false);
            }
          })();
        }}
      >
        <p className="account-meta">
          Access continues until {formatDateTime(summary?.subscription.cancellationEffectiveAt ?? summary?.subscription.currentPeriodEnd ?? null)} when a period end is available.
        </p>
      </ConfirmationDialog>
        </>
      )}
    </>
  );
}
