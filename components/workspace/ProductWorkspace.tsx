"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConsoleShell } from "@/components/console/ConsoleShell";
import { WorkspaceDashboard } from "@/components/workspace/WorkspaceDashboard";
import { useAuth } from "@/src/providers/auth-provider";

export function ProductWorkspace() {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    document.body.classList.add("workspace-body");
    return () => document.body.classList.remove("workspace-body");
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/sign-in");
    }
  }, [router, status]);

  if (status === "loading") {
    return (
      <main className="workspace-loading workspace-loading--portal" aria-label="Loading YDeck workspace">
        <div><span /><span /><span /></div>
      </main>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  // No sidebar by design: Home stays chrome-light and leads with workspace
  // state. Global navigation lives in the shell's top bar.
  return (
    <ConsoleShell surfaceClassName="workspace-shell workspace-dashboard">
      <WorkspaceDashboard />
    </ConsoleShell>
  );
}
