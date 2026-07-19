import type { ReactNode } from "react";
import { Suspense } from "react";
import { RequireAuth } from "@/src/providers/auth-provider";
import { SettingsShell } from "@/components/account/ui";
import "./settings-production.css";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<main className="account-page account-page--center"><div className="account-skeleton-card" aria-label="Loading account" /></main>}>
      <RequireAuth>
        <SettingsShell>{children}</SettingsShell>
      </RequireAuth>
    </Suspense>
  );
}
