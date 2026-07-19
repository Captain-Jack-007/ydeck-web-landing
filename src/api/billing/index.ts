import { apiRequest } from "@/src/api/client";
import type { Page, PublicInvoice, PublicPlan, WorkspaceBillingSummary } from "@/src/api/types";

export type BillingInterval = "monthly" | "annual";

export async function listPlans() {
  return apiRequest<PublicPlan[]>("/api/v1/plans", {
    auth: false,
    retryOnAuth: false,
  });
}

export async function getBillingSummary(workspaceId: string) {
  return apiRequest<WorkspaceBillingSummary>(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/billing`);
}

export async function createCheckout(input: {
  workspaceId: string;
  planKey: string;
  billingInterval: BillingInterval;
  successReturnPath: string;
  cancelReturnPath: string;
  idempotencyKey: string;
}) {
  return apiRequest<{ checkoutSessionId: string; checkoutUrl: string; expiresAt: string | null }>(
    "/api/v1/billing/checkout",
    {
      method: "POST",
      body: input,
    },
  );
}

export async function openBillingPortal(input: { workspaceId: string; returnPath: string }) {
  return apiRequest<{ portalUrl: string; expiresAt: string | null }>("/api/v1/billing/portal", {
    method: "POST",
    body: input,
  });
}

export async function changePlan(input: {
  workspaceId: string;
  planKey: string;
  billingInterval: BillingInterval;
  changeTiming?: "immediate";
}) {
  return apiRequest<{ ok: true }>("/api/v1/billing/subscription/change-plan", {
    method: "POST",
    body: input,
  });
}

export async function cancelSubscription(input: {
  workspaceId: string;
  timing?: "period_end" | "immediate";
  reason?: string;
}) {
  return apiRequest<{ ok: true }>("/api/v1/billing/subscription/cancel", {
    method: "POST",
    body: input,
  });
}

export async function reactivateSubscription(workspaceId: string) {
  return apiRequest<{ ok: true }>("/api/v1/billing/subscription/reactivate", {
    method: "POST",
    body: { workspaceId },
  });
}

export async function listInvoices(workspaceId: string, page = 1, limit = 25) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return apiRequest<Page<PublicInvoice>>(
    `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/billing/invoices?${params.toString()}`,
  );
}
