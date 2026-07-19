import { Suspense } from "react";
import { SkeletonBlock } from "@/components/account/ui";
import DesktopPairingClient from "./pairing-client";

export default function DesktopPairingPage() {
  return (
    <Suspense fallback={<main className="auth-page"><section className="auth-card"><SkeletonBlock rows={5} /></section></main>}>
      <DesktopPairingClient />
    </Suspense>
  );
}
