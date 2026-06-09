"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Building2,
  Check,
  Cloud,
  Download,
  FileText,
  GraduationCap,
  Laptop,
  Layers3,
  LockKeyhole,
  Menu,
  MessageSquareText,
  Presentation,
  QrCode,
  Rocket,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { WaitlistForm } from "@/components/WaitlistForm";
import { WaitlistModal } from "@/components/WaitlistModal";
import { defaultLocale, isLocale, locales, translations, type Locale } from "@/lib/i18n";

const useCaseIcons = [Rocket, Building2, Layers3, GraduationCap];
const workflowIcons = [MessageSquareText, BrainCircuit, Presentation];

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const t = translations[locale];

  useEffect(() => {
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.16,
      },
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [locale]);

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

  function openModal() {
    setModalOpen(true);
    setNavOpen(false);
  }

  function selectLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", nextLocale);
    window.history.replaceState({}, "", url);
  }

  return (
    <main>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="YDeck home">
          <Image src="/ydeck.png" alt="" width={42} height={54} priority />
          <span>YDeck</span>
        </Link>
        <button className="icon-button nav-toggle" onClick={() => setNavOpen((open) => !open)} aria-label="Toggle menu">
          {navOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={navOpen ? "site-nav open" : "site-nav"} aria-label="Primary navigation">
          <a href="#solution">{t.nav.solution}</a>
          <a href="#modes">{t.nav.modes}</a>
          <a href="#pilot">{t.nav.pilot}</a>
          <div className="language-switcher" aria-label={t.nav.language}>
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
          <button className="nav-cta" onClick={openModal}>{t.nav.join}</button>
        </nav>
      </header>

      <button className="sticky-waitlist-cta" onClick={openModal}>
        {t.footer.sticky} <ArrowRight size={17} />
      </button>

      <section className="hero section-band">
        <div className="hero-copy reveal from-left">
          <p className="eyebrow"><ShieldCheck size={16} /> {t.hero.eyebrow}</p>
          <h1>YDeck</h1>
          <p className="hero-subtitle">{t.hero.subtitle}</p>
          <div className="hero-actions">
            <button className="primary-action" onClick={openModal}>
              {t.hero.primaryCta} <ArrowRight size={18} />
            </button>
            <a className="secondary-action" href="#workflow">
              {t.hero.secondaryCta} <ArrowDown size={18} />
            </a>
          </div>
          <p className="trust-line">
            <LockKeyhole size={17} /> {t.hero.trust}
          </p>
          <div className="mobile-hero-strip" aria-label="YDeck creation flow">
            <span><MessageSquareText size={16} /> {t.hero.strip[0]}</span>
            <ArrowRight size={16} />
            <span><Sparkles size={16} /> {t.hero.strip[1]}</span>
            <ArrowRight size={16} />
            <span><Download size={16} /> {t.hero.strip[2]}</span>
          </div>
          <div className="mobile-product-preview" aria-label="YDeck mobile product preview">
            <div className="mobile-preview-top">
              <span className="mobile-preview-brand">
                <Image src="/ydeck.png" alt="" width={24} height={31} />
                YDeck
              </span>
              <span className="mobile-private-status"><LockKeyhole size={13} /> {t.hero.mobileStatus}</span>
            </div>
            <div className="mobile-prompt-box">
              <MessageSquareText size={16} />
              <span>{t.hero.mobilePrompt}</span>
            </div>
            <div className="mobile-slide-list">
              <div className="mobile-slide-card active">
                <span>01</span>
                <strong>{t.hero.mobileSlides[0]}</strong>
              </div>
              <div className="mobile-slide-card">
                <span>02</span>
                <strong>{t.hero.mobileSlides[1]}</strong>
              </div>
              <div className="mobile-slide-card">
                <span>03</span>
                <strong>{t.hero.mobileSlides[2]}</strong>
              </div>
            </div>
            <button className="mobile-export-button" type="button">
              <Download size={16} /> {t.hero.export}
            </button>
          </div>
        </div>

        <div className="hero-visual reveal from-right delay-1" aria-label="Prompt to YDeck to PPTX visual">
          <div className="prompt-composer">
            <MessageSquareText size={20} />
            <span>{t.hero.prompt}</span>
            <button aria-label={t.hero.generate}><Sparkles size={17} /></button>
          </div>
          <div className="deck-preview">
            <div className="deck-preview-header">
              <div>
                <span>{t.hero.outputLabel}</span>
                <strong>{t.hero.outputTitle}</strong>
              </div>
              <span className="privacy-pill"><LockKeyhole size={14} /> {t.hero.privacyPill}</span>
            </div>
            <div className="slide-canvas">
              <div className="slide-sidebar">
                <span className="active" />
                <span />
                <span />
                <span />
              </div>
              <div className="slide-main">
                <span className="slide-tag">{t.hero.slideTag}</span>
                <h3>{t.hero.slideTitle}</h3>
                <div className="slide-chart">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div className="slide-lines" />
              </div>
            </div>
            <div className="deck-actions">
              <span><FileText size={15} /> {t.hero.slidesPlanned}</span>
              <span><Download size={15} /> {t.hero.pptxReady}</span>
            </div>
          </div>
          <div className="mini-deck deck-a" />
          <div className="mini-deck deck-b" />
        </div>
      </section>

      <section className="problem-section" id="problem">
        <div className="section-heading reveal from-left">
          <p className="eyebrow">{t.problem.eyebrow}</p>
          <h2>{t.problem.title}</h2>
        </div>
        <div className="problem-grid">
          {t.problem.items.map((problem, index) => (
            <article
              className={`problem-item reveal ${index % 2 === 0 ? "from-left" : "from-right"}`}
              style={{ transitionDelay: `${index * 80}ms` }}
              key={`problem-${index}`}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{problem}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="solution-section section-band" id="solution">
        <div className="section-heading reveal from-right">
          <p className="eyebrow"><Sparkles size={16} /> {t.solution.eyebrow}</p>
          <h2>{t.solution.title}</h2>
          <p>{t.solution.text}</p>
        </div>
        <div className="use-case-grid">
          {t.solution.useCases.map(([title, text], index) => {
            const Icon = useCaseIcons[index];
            return (
            <article
              className={`use-case-card reveal ${index % 2 === 0 ? "from-left" : "from-right"}`}
              style={{ transitionDelay: `${index * 70}ms` }}
              key={`use-case-${index}`}
            >
              <div className="card-icon"><Icon size={22} /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
            );
          })}
        </div>
      </section>

      <section className="modes-section" id="modes">
        <div className="section-heading reveal from-left">
          <p className="eyebrow">{t.modes.eyebrow}</p>
          <h2>{t.modes.title}</h2>
        </div>
        <div className="mode-grid">
          <article className="mode-panel private-mode reveal from-left">
            <span className="mode-badge"><LockKeyhole size={15} /> {t.modes.privateBadge}</span>
            <div className="mode-top">
              <Laptop size={28} />
              <h3>{t.modes.privateTitle}</h3>
            </div>
            <ul>
              {t.modes.privateItems.map((item) => (
                <li key={item}><Check size={18} /> {item}</li>
              ))}
            </ul>
          </article>
          <article className="mode-panel cloud-mode reveal from-right delay-1">
            <span className="mode-badge"><Cloud size={15} /> {t.modes.cloudBadge}</span>
            <div className="mode-top">
              <Cloud size={28} />
              <h3>{t.modes.cloudTitle}</h3>
            </div>
            <ul>
              {t.modes.cloudItems.map((item) => (
                <li key={item}><Check size={18} /> {item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="workflow-section section-band" id="workflow">
        <div className="section-heading reveal from-right">
          <p className="eyebrow">{t.workflow.eyebrow}</p>
          <h2>{t.workflow.title}</h2>
        </div>
        <div className="workflow">
          {t.workflow.steps.map(([title, text], index) => {
            const StepIcon = workflowIcons[index];
            return (
              <article
                className={`workflow-step reveal ${index % 2 === 0 ? "from-left" : "from-right"}`}
                style={{ transitionDelay: `${index * 90}ms` }}
                key={`workflow-${index}`}
              >
                <span className="step-number">{index + 1}</span>
                <StepIcon size={24} />
                <h3>{title as string}</h3>
                <p>{text as string}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="pilot-benefits-section">
        <div className="section-heading reveal from-left">
          <p className="eyebrow"><BadgeCheck size={16} /> {t.pilot.eyebrow}</p>
          <h2>{t.pilot.sectionTitle}</h2>
          <p>{t.pilot.sectionText}</p>
        </div>
        <div className="pilot-benefits-layout">
          <div className="pilot-highlight reveal from-left">
            <strong>{t.pilot.highlightTitle}</strong>
            <p>{t.pilot.highlightText}</p>
          </div>
          <div className="pilot-benefit-cards">
            {t.pilot.summaryCards.map(([title, text], index) => (
              <article
                className={`pilot-benefit-card reveal ${index % 2 === 0 ? "from-left" : "from-right"}`}
                key={`pilot-card-${index}`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
        <p className="pilot-extra-line reveal from-right">{t.pilot.extraLine}</p>
      </section>

      <section className="pilot-section" id="pilot">
        <div className="pilot-copy reveal from-left">
          <p className="eyebrow"><BadgeCheck size={16} /> {t.pilot.eyebrow}</p>
          <h2>{t.pilot.title}</h2>
          <p>{t.pilot.text}</p>
          <div className="qr-panel">
            <div className="qr-code" aria-hidden="true">
              {Array.from({ length: 25 }).map((_, index) => (
                <span key={index} className={index % 3 === 0 || index % 7 === 0 ? "filled" : ""} />
              ))}
            </div>
            <div>
              <strong>{t.pilot.qrTitle}</strong>
              <p>{t.pilot.qrText}</p>
            </div>
            <QrCode size={22} />
          </div>
          <Link className="secondary-action standalone-link" href={`/waitlist?lang=${locale}`}>
            {t.pilot.dedicatedLink} <ArrowRight size={18} />
          </Link>
        </div>
        <div className="pilot-form-shell reveal from-right delay-1">
          <WaitlistForm locale={locale} />
        </div>
      </section>

      <section className="faq-section section-band" id="faq">
        <div className="section-heading reveal from-left">
          <p className="eyebrow">{t.faq.eyebrow}</p>
          <h2>{t.faq.title}</h2>
        </div>
        <div className="faq-grid">
          {t.faq.items.map(([question, answer], index) => (
            <article
              className={`faq-item reveal ${index % 2 === 0 ? "from-left" : "from-right"}`}
              style={{ transitionDelay: `${index * 80}ms` }}
              key={`faq-${index}`}
            >
              <h3>{question}</h3>
              <p>{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <Link className="brand" href="/">
          <Image src="/ydeck.png" alt="" width={34} height={43} />
          <span>YDeck</span>
        </Link>
        <p>{t.footer.text}</p>
        <button className="primary-action small" onClick={openModal}>{t.footer.cta}</button>
      </footer>

      <WaitlistModal open={modalOpen} onClose={() => setModalOpen(false)} locale={locale} />
    </main>
  );
}
