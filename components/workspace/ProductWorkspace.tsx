"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DesktopPortalHome } from "@/components/workspace/DesktopPortalHome";
import { ProductTopBar } from "@/components/workspace/ProductTopBar";
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

  return (
    <main className="workspace-shell workspace-shell--portal">
      <ProductTopBar />
      <section className="workspace-canvas desktop-portal-canvas">
        <DesktopPortalHome />
      </section>
    </main>
  );
}
