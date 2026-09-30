import { Suspense, type ReactNode } from "react";
import { ConsoleShell } from "@/components/console/ConsoleShell";
import { RequireAuth } from "@/src/providers/auth-provider";

export default function IntegrationsLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <main className="account-page account-page--center">
          <div className="account-skeleton-card" aria-label="Loading integrations" />
        </main>
      }
    >
      <RequireAuth>
        <ConsoleShell>{children}</ConsoleShell>
      </RequireAuth>
    </Suspense>
  );
}
