import { Suspense } from "react";
import { SkeletonBlock } from "@/components/account/ui";
import SignUpClient from "./sign-up-client";

export default function SignUpPage() {
  return (
    <Suspense fallback={<main className="auth-page"><section className="auth-card"><SkeletonBlock rows={5} /></section></main>}>
      <SignUpClient />
    </Suspense>
  );
}
