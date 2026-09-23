"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertCircle, Ban, Clock3, ExternalLink } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import {
  INSTAGRAM_DESKTOP_CHANNELS_URL,
  instagramErrorExperience,
  isDesktopDeepLinkEnabled,
} from "@/src/lib/instagram-oauth-completion";

export function InstagramOAuthError() {
  const searchParams = useSearchParams();
  const experience = useMemo(
    () => instagramErrorExperience(searchParams.get("reason")),
    [searchParams],
  );
  const desktopEnabled = isDesktopDeepLinkEnabled();
  const Icon = experience.state === "CANCELLED" ? Ban : experience.state === "EXPIRED" ? Clock3 : AlertCircle;

  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState(window.history.state, "", "/connect/instagram/error");
    }
  }, []);

  return (
    <main className="instagram-error-page">
      <section className="instagram-error-card" aria-labelledby="instagram-error-title" data-state={experience.state}>
        <Link className="instagram-error-brand" href="/" aria-label="YDeck home">
          <Image src="/ydeck.png" alt="" width={32} height={41} priority />
          <strong>YDeck</strong>
        </Link>
        <span className="instagram-error-icon"><Icon aria-hidden size={26} /></span>
        <p className="instagram-error-context">Instagram connection</p>
        <h1 id="instagram-error-title">{experience.title}</h1>
        <p role={experience.state === "CANCELLED" ? "status" : "alert"}>{experience.message}</p>
        <div className="instagram-error-actions">
          {desktopEnabled ? (
            <a className="instagram-error-button instagram-error-button--primary" href={INSTAGRAM_DESKTOP_CHANNELS_URL}>
              Continue in YDeck <ExternalLink aria-hidden size={16} />
            </a>
          ) : (
            <Link className="instagram-error-button instagram-error-button--primary" href="/sales-operator/channels">
              Return to YDeck channels
            </Link>
          )}
          {desktopEnabled ? (
            <Link className="instagram-error-button instagram-error-button--secondary" href="/sales-operator/channels">
              Try again in browser
            </Link>
          ) : null}
        </div>
        <p className="instagram-error-hint">
          {desktopEnabled
            ? "If YDeck doesn’t open, return to the YDeck Desktop app."
            : "Return to YDeck Desktop and try connecting Instagram again."}
        </p>
      </section>
    </main>
  );
}
