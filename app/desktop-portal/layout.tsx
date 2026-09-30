import { Suspense, type ReactNode } from "react";
import { ConsoleShell } from "@/components/console/ConsoleShell";
import { RequireAuth } from "@/src/providers/auth-provider";

export default function DesktopPortalLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <main className="account-page account-page--center">
          <div className="account-skeleton-card" aria-label="Loading YDeck Desktop" />
        </main>
      }
    >
      <RequireAuth>
        {/* Keeps the portal's own surface class so its existing stylesheet
            (downloads, walkthrough, capability grid) continues to apply. */}
        <ConsoleShell surfaceClassName="workspace-shell workspace-shell--portal">{children}</ConsoleShell>
      </RequireAuth>
    </Suspense>
  );
}
