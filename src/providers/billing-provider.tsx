"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as billingApi from "@/src/api/billing";
import { getHumanErrorMessage } from "@/src/api/client";
import type { Page, PublicInvoice, PublicPlan, WorkspaceBillingSummary } from "@/src/api/types";
import { validateBillingRedirectUrl } from "@/src/lib/billing-url";
import { useAuth } from "@/src/providers/auth-provider";
import { useWorkspace } from "@/src/providers/workspace-provider";

type BillingStatus = "idle" | "loading" | "ready" | "error";
type InvoiceStatus = "idle" | "loading" | "ready" | "error";

type BillingContextValue = {
  status: BillingStatus;
  plansStatus: BillingStatus;
  summaryStatus: BillingStatus;
  plans: PublicPlan[];
  summary: WorkspaceBillingSummary | null;
  invoices: Page<PublicInvoice> | null;
  error: string | null;
  plansError: string | null;
  summaryError: string | null;
  invoiceStatus: InvoiceStatus;
  invoiceError: string | null;
  refreshBilling: () => Promise<void>;
  refreshPlans: () => Promise<void>;
  refreshInvoices: (page?: number) => Promise<void>;
  checkout: (planKey: string, billingInterval: billingApi.BillingInterval) => Promise<void>;
  portal: () => Promise<void>;
  cancel: (reason?: string) => Promise<void>;
  reactivate: () => Promise<void>;
};

const BillingContext = createContext<BillingContextValue | null>(null);

function createIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `checkout:${crypto.randomUUID()}`;
  }
  return `checkout:${Date.now()}`;
}

export function BillingProvider({ children }: { children: ReactNode }) {
  const { status: authStatus } = useAuth();
  const { workspace, cacheVersion } = useWorkspace();
  const [status, setStatus] = useState<BillingStatus>("idle");
  const [plansStatus, setPlansStatus] = useState<BillingStatus>("idle");
  const [summaryStatus, setSummaryStatus] = useState<BillingStatus>("idle");
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [summary, setSummary] = useState<WorkspaceBillingSummary | null>(null);
  const [invoices, setInvoices] = useState<Page<PublicInvoice> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>("idle");
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const billingRequestId = useRef(0);
  const plansRequestId = useRef(0);
  const invoicesRequestId = useRef(0);

  const refreshPlans = useCallback(async () => {
    const requestId = ++plansRequestId.current;
    setPlansStatus("loading");
    setPlansError(null);
    try {
      const nextPlans = await billingApi.listPlans();
      if (plansRequestId.current === requestId) {
        setPlans(nextPlans);
        setPlansStatus("ready");
      }
    } catch (loadError) {
      if (plansRequestId.current === requestId) {
        setPlansError(getHumanErrorMessage(loadError));
        setPlansStatus("error");
      }
      throw loadError;
    }
  }, []);

  const refreshSummary = useCallback(async () => {
    const requestId = ++billingRequestId.current;
    setSummary(null);
    setSummaryError(null);
    setInvoices(null);
    setInvoiceStatus("idle");
    setInvoiceError(null);
    if (authStatus !== "authenticated" || !workspace?.id) {
      setSummaryStatus("idle");
      return;
    }
    setSummaryStatus("loading");
    try {
      const nextSummary = await billingApi.getBillingSummary(workspace.id);
      if (billingRequestId.current === requestId) {
        setSummary(nextSummary);
        setSummaryStatus("ready");
      }
    } catch (loadError) {
      if (billingRequestId.current === requestId) {
        setSummaryError(getHumanErrorMessage(loadError));
        setSummaryStatus("error");
      }
      throw loadError;
    }
  }, [authStatus, workspace?.id]);

  const refreshBilling = useCallback(async () => {
    setStatus("loading");
    setError(null);
    const results = await Promise.allSettled([refreshPlans(), refreshSummary()]);
    const failure = results.find((result) => result.status === "rejected");
    if (failure?.status === "rejected") {
      setError(getHumanErrorMessage(failure.reason));
    }
    setStatus(results.every((result) => result.status === "rejected") ? "error" : "ready");
  }, [refreshPlans, refreshSummary]);

  useEffect(() => {
    if (plansStatus === "idle") {
      void refreshPlans().catch(() => undefined);
    }
  }, [plansStatus, refreshPlans]);

  useEffect(() => {
    void refreshSummary().catch(() => undefined);
  }, [cacheVersion, refreshSummary]);

  useEffect(() => {
    setError(summaryError ?? plansError);
    if (plansStatus === "loading" || summaryStatus === "loading") {
      setStatus("loading");
    } else if (plansStatus === "error" && summaryStatus === "error") {
      setStatus("error");
    } else if (plansStatus === "ready" || summaryStatus === "ready") {
      setStatus("ready");
    } else {
      setStatus("idle");
    }
  }, [plansError, plansStatus, summaryError, summaryStatus]);

  const refreshInvoices = useCallback(
    async (page = 1) => {
      const requestId = ++invoicesRequestId.current;
      if (!workspace?.id) {
        setInvoices(null);
        setInvoiceStatus("idle");
        setInvoiceError(null);
        return;
      }
      setInvoices(null);
      setInvoiceStatus("loading");
      setInvoiceError(null);
      try {
        const nextInvoices = await billingApi.listInvoices(workspace.id, page);
        if (invoicesRequestId.current === requestId) {
          setInvoices(nextInvoices);
          setInvoiceStatus("ready");
        }
      } catch (loadError) {
        if (invoicesRequestId.current === requestId) {
          setInvoiceError(getHumanErrorMessage(loadError));
          setInvoiceStatus("error");
        }
      }
    },
    [workspace?.id],
  );

  const checkout = useCallback(
    async (planKey: string, billingInterval: billingApi.BillingInterval) => {
      if (!workspace?.id) {
        throw new Error("Select a workspace before checkout.");
      }
      const response = await billingApi.createCheckout({
        workspaceId: workspace.id,
        planKey,
        billingInterval,
        successReturnPath: "/settings/billing?success=true",
        cancelReturnPath: "/settings/billing?cancelled=true",
        idempotencyKey: createIdempotencyKey(),
      });
      window.location.assign(validateBillingRedirectUrl(response.checkoutUrl));
    },
    [workspace?.id],
  );

  const portal = useCallback(async () => {
    if (!workspace?.id) {
      return;
    }
    const response = await billingApi.openBillingPortal({
      workspaceId: workspace.id,
      returnPath: "/settings/billing?success=true",
    });
    window.location.assign(validateBillingRedirectUrl(response.portalUrl));
  }, [workspace?.id]);

  const cancel = useCallback(
    async (reason?: string) => {
      if (!workspace?.id) {
        return;
      }
      await billingApi.cancelSubscription({
        workspaceId: workspace.id,
        timing: "period_end",
        reason,
      });
      await refreshBilling();
    },
    [refreshBilling, workspace?.id],
  );

  const reactivate = useCallback(async () => {
    if (!workspace?.id) {
      return;
    }
    await billingApi.reactivateSubscription(workspace.id);
    await refreshBilling();
  }, [refreshBilling, workspace?.id]);

  const value = useMemo<BillingContextValue>(
    () => ({
      status,
      plansStatus,
      summaryStatus,
      plans,
      summary,
      invoices,
      error,
      plansError,
      summaryError,
      invoiceStatus,
      invoiceError,
      refreshBilling,
      refreshPlans,
      refreshInvoices,
      checkout,
      portal,
      cancel,
      reactivate,
    }),
    [
      cancel,
      checkout,
      error,
      invoiceError,
      invoiceStatus,
      invoices,
      plans,
      plansError,
      plansStatus,
      portal,
      reactivate,
      refreshBilling,
      refreshInvoices,
      refreshPlans,
      status,
      summary,
      summaryError,
      summaryStatus,
    ],
  );

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling() {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error("useBilling must be used within BillingProvider.");
  }
  return context;
}
