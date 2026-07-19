"use client";

import { useEffect, useState } from "react";
import { Button, EmptyState, Panel, SettingsHeader, SkeletonBlock, StatusBadge, WorkspaceRequiredState } from "@/components/account/ui";
import { isAllowedBillingUrl } from "@/src/lib/billing-url";
import { formatCurrencyMinor, formatDateTime } from "@/src/lib/format";
import { useBilling } from "@/src/providers/billing-provider";
import { useWorkspace } from "@/src/providers/workspace-provider";

export default function InvoicesPage() {
  const { workspace } = useWorkspace();
  const { invoices, refreshInvoices, invoiceStatus, invoiceError, summary } = useBilling();
  const [page, setPage] = useState(1);
  const [pagingAction, setPagingAction] = useState<"previous" | "next" | null>(null);
  const formatStatus = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

  useEffect(() => {
    let active = true;
    if (workspace?.id) {
      void refreshInvoices(page).finally(() => {
        if (active) {
          setPagingAction(null);
        }
      });
    } else {
      setPagingAction(null);
    }
    return () => {
      active = false;
    };
  }, [page, refreshInvoices, workspace?.id]);

  return (
    <>
      <SettingsHeader
        title="Invoices"
        description="Review workspace invoice history and open provider-hosted receipts when available."
        scope="Workspace"
      />
      {!workspace ? (
        <WorkspaceRequiredState
          title="Select a workspace to view invoices"
          description="Invoices are issued to workspaces, not individual browser sessions."
        />
      ) : (
      <Panel title="Invoice history" description={`Invoices for ${workspace.name}`}>
        {invoiceStatus === "loading" || invoiceStatus === "idle" ? (
          <SkeletonBlock rows={4} />
        ) : invoiceStatus === "error" ? (
          <EmptyState
            title="Invoice history unavailable"
            action={<Button type="button" variant="secondary" onClick={() => void refreshInvoices(page)}>Try again</Button>}
          >
            {invoiceError ?? "YDeck could not load invoices for this workspace."}
          </EmptyState>
        ) : invoices?.items?.length ? (
          <div className="account-table invoice-table" role="table" aria-label="Workspace invoices">
            <div className="invoice-table__header" role="row">
              <span role="columnheader">Invoice</span>
              <span role="columnheader">Date</span>
              <span role="columnheader">Amount</span>
              <span role="columnheader">Status</span>
              <span role="columnheader">Receipt</span>
            </div>
            {invoices.items.map((invoice) => (
              <div className="account-table-row invoice-table__row" role="row" key={invoice.id}>
                <strong role="cell" data-label="Invoice">{invoice.number ?? "Invoice number unavailable"}</strong>
                <span role="cell" data-label="Date">
                  {formatDateTime(invoice.createdAt ?? null)}
                  {invoice.periodStart || invoice.periodEnd ? <small>{formatDateTime(invoice.periodStart ?? null)} – {formatDateTime(invoice.periodEnd ?? null)}</small> : null}
                </span>
                <span role="cell" data-label="Amount">
                  {invoice.currency && (invoice.amountPaidMinor ?? invoice.amountDueMinor) != null
                    ? formatCurrencyMinor(invoice.amountPaidMinor ?? invoice.amountDueMinor ?? 0, invoice.currency)
                    : "Unavailable"}
                </span>
                <span role="cell" data-label="Status"><StatusBadge tone={invoice.status ?? "neutral"}>{invoice.status ? formatStatus(invoice.status) : "Unavailable"}</StatusBadge></span>
                <span role="cell" data-label="Receipt">
                  {invoice.hostedInvoiceUrl && isAllowedBillingUrl(invoice.hostedInvoiceUrl) ? (
                    <a className="account-link account-link--compact" href={invoice.hostedInvoiceUrl} rel="noreferrer noopener" target="_blank">
                      Open
                    </a>
                  ) : <span className="account-meta">Unavailable</span>}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No invoices yet">
            {summary?.subscription.planKey === "free"
              ? "Free workspaces do not receive invoices. Billing history will appear after the workspace completes its first paid transaction."
              : "Invoices will appear here after the workspace completes its first billed transaction."}
          </EmptyState>
        )}
        {invoices?.items?.length && (page > 1 || invoices.hasNextPage) ? (
        <div className="account-actions account-actions--section">
          <Button
            variant="secondary"
            type="button"
            loading={pagingAction === "previous"}
            disabled={page === 1 || invoiceStatus === "loading" || pagingAction !== null}
            onClick={() => {
              setPagingAction("previous");
              setPage((current) => Math.max(1, current - 1));
            }}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            type="button"
            loading={pagingAction === "next"}
            disabled={invoiceStatus === "loading" || pagingAction !== null || invoices?.hasNextPage === false}
            onClick={() => {
              setPagingAction("next");
              setPage((current) => current + 1);
            }}
          >
            Next
          </Button>
        </div>
        ) : null}
      </Panel>
      )}
    </>
  );
}
