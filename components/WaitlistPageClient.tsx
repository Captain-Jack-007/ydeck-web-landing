"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Check, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import { WaitlistForm } from "@/components/WaitlistForm";
import { isLocale, locales, translations, type Locale } from "@/lib/i18n";

type WaitlistPageClientProps = {
  initialLocale: Locale;
};

export function WaitlistPageClient({ initialLocale }: WaitlistPageClientProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const t = translations[locale];

  useEffect(() => {
    const urlLocale = new URLSearchParams(window.location.search).get("lang");
    const storedLocale = window.localStorage.getItem("ydeck-locale");

    if (isLocale(urlLocale)) {
      setLocale(urlLocale);
    } else if (isLocale(storedLocale)) {
      setLocale(storedLocale);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("ydeck-locale", locale);
    document.documentElement.lang = locale === "zh" ? "zh-CN" : locale;
  }, [locale]);

  function selectLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", nextLocale);
    window.history.replaceState({}, "", url);
  }

  return (
    <main className="waitlist-page">
      <div className="waitlist-topbar">
        <Link className="back-link" href={`/?lang=${locale}`}>
          <ArrowLeft size={18} /> {t.waitlistPage.back}
        </Link>
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
          <Image src="/ydeck.png" alt="YDeck logo" width={76} height={97} priority />
          <p className="eyebrow"><BadgeCheck size={16} /> {t.waitlistPage.eyebrow}</p>
          <h1>{t.waitlistPage.title}</h1>
          <p>{t.waitlistPage.text}</p>
          <div className="pilot-highlight">
            <strong>{t.pilot.highlightTitle}</strong>
            <p>{t.pilot.highlightText}</p>
          </div>
          <div className="pilot-benefit-cards compact-benefits">
            {t.pilot.summaryCards.map(([title, text], index) => (
              <article className="pilot-benefit-card" key={`waitlist-benefit-${index}`}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <p className="pilot-extra-line">{t.pilot.extraLine}</p>
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
