import type { Metadata } from "next";
import { Suspense } from "react";
import { InstagramOAuthError } from "@/components/sales-operator/InstagramOAuthError";
import "./instagram-error.css";

export const metadata: Metadata = {
  title: "Instagram connection — YDeck",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function InstagramErrorPage() {
  return (
    <Suspense fallback={<main className="instagram-error-page" aria-label="Loading Instagram connection result" />}>
      <InstagramOAuthError />
    </Suspense>
  );
}
