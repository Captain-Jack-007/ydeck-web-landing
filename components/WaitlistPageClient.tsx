"use client";

import Image from "next/image";
import { BadgeCheck, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import { WaitlistForm } from "@/components/WaitlistForm";
import { isLocale, locales, translations, type Locale } from "@/lib/i18n";
import { detectClientLocale, readStoredLocalePreference, writeStoredLocalePreference } from "@/lib/locale";

type WaitlistPageClientProps = {
  initialLocale: Locale;
};

export function WaitlistPageClient({ initialLocale }: WaitlistPageClientProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const t = translations[locale];

  useEffect(() => {
    const urlLocale = new URLSearchParams(window.location.search).get("lang");
    const storedLocale = readStoredLocalePreference();

    if (isLocale(urlLocale)) {
      writeStoredLocalePreference(urlLocale);
      setLocale(urlLocale);
    } else if (storedLocale) {
      setLocale(storedLocale);
    } else {
      setLocale(detectClientLocale());
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function selectLocale(nextLocale: Locale) {
    writeStoredLocalePreference(nextLocale);
    setLocale(nextLocale);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", nextLocale);
    window.history.replaceState({}, "", url);
  }

  return (
    <main className="waitlist-page">
      <div className="waitlist-topbar">
        <div className="language-switcher waitlist-language" aria-label={t.nav.language}>
          {locales.map((item) => (
            <button
              aria-pressed={locale === item.code}
              className={locale === item.code ? "active" : ""}
              key={item.code}
              onClick={() => selectLocale(item.code)}
              title={item.name}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <section className="waitlist-hero">
        <div className="waitlist-intro">
          <Image src="/ydeck.png" alt="YDeck logo" width={76} height={97} loading="eager" priority />
          <p className="eyebrow"><BadgeCheck size={16} /> {t.waitlistPage.eyebrow}</p>
          <h1>{t.waitlistPage.title}</h1>
          <p>{t.waitlistPage.text}</p>
          <div className="waitlist-summary" aria-label={t.pilot.highlightTitle}>
            {t.pilot.summaryCards.map(([title, text]) => (
              <div className="waitlist-summary-card" key={title}>
                <p>{title}</p>
                <span>{text}</span>
              </div>
            ))}
          </div>
          <p className="trust-line">
            <LockKeyhole size={17} /> {t.waitlistPage.trust}
          </p>
        </div>
        <div className="pilot-form-shell dedicated">
          <WaitlistForm locale={locale} />
        </div>
      </section>
    </main>
  );
}
