import { Suspense, type ReactNode } from "react";
import { SalesOperatorShell } from "@/components/sales-operator/SalesOperatorShell";
import { RequireAuth } from "@/src/providers/auth-provider";
import { SalesOperatorChannelsProvider } from "@/src/providers/sales-operator-channels-provider";
import "./sales-operator.css";

export default function SalesOperatorLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<main className="account-page account-page--center"><div className="account-skeleton-card" aria-label="Loading Sales Operator" /></main>}>
      <RequireAuth preserveSearchParams={false} preserveInstagramCompletionContext>
        <SalesOperatorChannelsProvider>
          <SalesOperatorShell>{children}</SalesOperatorShell>
        </SalesOperatorChannelsProvider>
      </RequireAuth>
    </Suspense>
  );
}
