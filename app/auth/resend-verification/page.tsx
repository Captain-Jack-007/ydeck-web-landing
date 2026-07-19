import { Suspense } from "react";
import { SkeletonBlock } from "@/components/account/ui";
import ResendVerificationClient from "./resend-verification-client";

export default function ResendVerificationPage() {
  return (
    <Suspense fallback={<main className="auth-page"><section className="auth-card"><SkeletonBlock rows={4} /></section></main>}>
      <ResendVerificationClient />
    </Suspense>
  );
}
