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

const problems = [
  "Creating professional presentations takes too much time.",
  "Most AI tools still require uploading private files to the cloud.",
  "Design quality is inconsistent.",
  "Teams waste hours rewriting and formatting slides.",
];

const useCases = [
  { title: "Pitch Decks", icon: Rocket, text: "Investor-ready structure, story arc, and crisp visual flow." },
  { title: "Business Proposals", icon: Building2, text: "Turn scopes, notes, and offers into polished client decks." },
  { title: "Training Slides", icon: Layers3, text: "Build structured modules for onboarding, process, and enablement." },
  { title: "Education Lessons", icon: GraduationCap, text: "Convert lesson goals into explainable, classroom-ready slides." },
];

const pilotBenefits = [
  "Early access",
  "Free pilot testing",
  "Private agent demo",
  "Custom feedback session",
  "Priority access to new templates",
];

const faqs = [
  {
    question: "Can YDeck run privately?",
    answer:
      "Yes. Private Mode is designed for local execution so sensitive files and prompts can remain on your own device.",
  },
  {
    question: "Who is the pilot for?",
    answer:
      "Founders, educators, consultants, companies, and organizations that regularly create decks and want to test YDeck before launch.",
  },
  {
    question: "What can I export?",
    answer:
      "The landing concept is focused on PPTX and PDF export so teams can keep working in familiar presentation workflows.",
  },
  {
    question: "Is the cloud agent still available?",
    answer:
      "Yes. The cloud agent is intended for speed, convenience, and access from web or social platforms.",
  },
];

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

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
  }, []);

  function openModal() {
    setModalOpen(true);
    setNavOpen(false);
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
          <a href="#solution">Solution</a>
          <a href="#modes">Private vs Cloud</a>
          <a href="#pilot">Pilot</a>
          <button className="nav-cta" onClick={openModal}>Join waitlist</button>
        </nav>
      </header>

      <button className="sticky-waitlist-cta" onClick={openModal}>
        Join pilot <ArrowRight size={17} />
      </button>

      <section className="hero section-band">
        <div className="hero-copy reveal from-left">
          <p className="eyebrow"><ShieldCheck size={16} /> Private AI Presentation Agent</p>
          <h1>YDeck</h1>
          <p className="hero-subtitle">
            Create pitch decks, business proposals, training slides, and lessons with an AI agent that
            can run locally on your device or in the cloud.
          </p>
          <div className="hero-actions">
            <button className="primary-action" onClick={openModal}>
              Join the Pilot Waitlist <ArrowRight size={18} />
            </button>
            <a className="secondary-action" href="#workflow">
              See How It Works <ArrowDown size={18} />
            </a>
          </div>
          <p className="trust-line">
            <LockKeyhole size={17} /> Private Mode keeps your files and prompts on your own device.
          </p>
          <div className="mobile-hero-strip" aria-label="YDeck creation flow">
            <span><MessageSquareText size={16} /> Prompt</span>
            <ArrowRight size={16} />
            <span><Sparkles size={16} /> Agent</span>
            <ArrowRight size={16} />
            <span><Download size={16} /> PPTX</span>
          </div>
          <div className="mobile-product-preview" aria-label="YDeck mobile product preview">
            <div className="mobile-preview-top">
              <span className="mobile-preview-brand">
                <Image src="/ydeck.png" alt="" width={24} height={31} />
                YDeck
              </span>
              <span className="mobile-private-status"><LockKeyhole size={13} /> Private</span>
            </div>
            <div className="mobile-prompt-box">
              <MessageSquareText size={16} />
              <span>Pitch deck for AI presentation agent</span>
            </div>
            <div className="mobile-slide-list">
              <div className="mobile-slide-card active">
                <span>01</span>
                <strong>Problem</strong>
              </div>
              <div className="mobile-slide-card">
                <span>02</span>
                <strong>Solution</strong>
              </div>
              <div className="mobile-slide-card">
                <span>03</span>
                <strong>Market</strong>
              </div>
            </div>
            <button className="mobile-export-button" type="button">
              <Download size={16} /> Export PPTX
            </button>
          </div>
        </div>

        <div className="hero-visual reveal from-right delay-1" aria-label="Prompt to YDeck to PPTX visual">
          <div className="prompt-composer">
            <MessageSquareText size={20} />
            <span>Create a 10-slide investor pitch deck for my startup</span>
            <button aria-label="Generate deck"><Sparkles size={17} /></button>
          </div>
          <div className="deck-preview">
            <div className="deck-preview-header">
              <div>
                <span>YDeck output</span>
                <strong>Seed round pitch deck</strong>
              </div>
              <span className="privacy-pill"><LockKeyhole size={14} /> Local-first</span>
            </div>
            <div className="slide-canvas">
              <div className="slide-sidebar">
                <span className="active" />
                <span />
                <span />
                <span />
              </div>
              <div className="slide-main">
                <span className="slide-tag">Market opportunity</span>
                <h3>AI decks that keep private files private.</h3>
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
              <span><FileText size={15} /> 10 slides planned</span>
              <span><Download size={15} /> PPTX ready</span>
            </div>
          </div>
          <div className="mini-deck deck-a" />
          <div className="mini-deck deck-b" />
        </div>
      </section>

      <section className="problem-section" id="problem">
        <div className="section-heading reveal from-left">
          <p className="eyebrow">The problem</p>
          <h2>Presentation work is still too manual.</h2>
        </div>
        <div className="problem-grid">
          {problems.map((problem, index) => (
            <article
              className={`problem-item reveal ${index % 2 === 0 ? "from-left" : "from-right"}`}
              style={{ transitionDelay: `${index * 80}ms` }}
              key={problem}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{problem}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="solution-section section-band" id="solution">
        <div className="section-heading reveal from-right">
          <p className="eyebrow"><Sparkles size={16} /> The solution</p>
          <h2>Turn ideas, documents, or notes into structured, branded presentations.</h2>
          <p>
            YDeck plans the story, slide outline, and visual direction before export.
          </p>
        </div>
        <div className="use-case-grid">
          {useCases.map(({ title, icon: Icon, text }, index) => (
            <article
              className={`use-case-card reveal ${index % 2 === 0 ? "from-left" : "from-right"}`}
              style={{ transitionDelay: `${index * 70}ms` }}
              key={title}
            >
              <div className="card-icon"><Icon size={22} /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="modes-section" id="modes">
        <div className="section-heading reveal from-left">
          <p className="eyebrow">Choose how your AI works</p>
          <h2>Private Agent for sensitive work. Cloud Agent for speed.</h2>
        </div>
        <div className="mode-grid">
          <article className="mode-panel private-mode reveal from-left">
            <span className="mode-badge"><LockKeyhole size={15} /> Local-first mode</span>
            <div className="mode-top">
              <Laptop size={28} />
              <h3>Private Agent</h3>
            </div>
            <ul>
              <li><Check size={18} /> Runs locally on your computer</li>
              <li><Check size={18} /> No upload required in Private Mode</li>
              <li><Check size={18} /> Best for confidential decks</li>
            </ul>
          </article>
          <article className="mode-panel cloud-mode reveal from-right delay-1">
            <span className="mode-badge"><Cloud size={15} /> Fast web access</span>
            <div className="mode-top">
              <Cloud size={28} />
              <h3>Cloud Agent</h3>
            </div>
            <ul>
              <li><Check size={18} /> Runs online</li>
              <li><Check size={18} /> Accessible from web and social platforms</li>
              <li><Check size={18} /> Best for speed and convenience</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="workflow-section section-band" id="workflow">
        <div className="section-heading reveal from-right">
          <p className="eyebrow">How it works</p>
          <h2>From prompt to presentation in three focused steps.</h2>
        </div>
        <div className="workflow">
          {[
            ["Describe your presentation", "Tell YDeck what you want to create.", MessageSquareText],
            ["AI creates the structure", "YDeck plans the outline, slides, and design.", BrainCircuit],
            ["Export your deck", "Download as PPTX or PDF.", Presentation],
          ].map(([title, text, Icon], index) => {
            const StepIcon = Icon as typeof MessageSquareText;
            return (
              <article
                className={`workflow-step reveal ${index % 2 === 0 ? "from-left" : "from-right"}`}
                style={{ transitionDelay: `${index * 90}ms` }}
                key={title as string}
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

      <section className="pilot-section" id="pilot">
        <div className="pilot-copy reveal from-left">
          <p className="eyebrow"><BadgeCheck size={16} /> Pilot program</p>
          <h2>Join the YDeck Pilot Program</h2>
          <p>
            We are inviting selected teams to test YDeck before public launch.
          </p>
          <div className="benefit-list">
            {pilotBenefits.map((benefit) => (
              <span key={benefit}><Check size={16} /> {benefit}</span>
            ))}
          </div>
          <div className="qr-panel">
            <div className="qr-code" aria-hidden="true">
              {Array.from({ length: 25 }).map((_, index) => (
                <span key={index} className={index % 3 === 0 || index % 7 === 0 ? "filled" : ""} />
              ))}
            </div>
            <div>
              <strong>Scan to join the pilot</strong>
              <p>Use this block for booth screens, flyers, and business cards.</p>
            </div>
            <QrCode size={22} />
          </div>
          <Link className="secondary-action standalone-link" href="/waitlist">
            Open dedicated waitlist page <ArrowRight size={18} />
          </Link>
        </div>
        <div className="pilot-form-shell reveal from-right delay-1">
          <WaitlistForm />
        </div>
      </section>

      <section className="faq-section section-band" id="faq">
        <div className="section-heading reveal from-left">
          <p className="eyebrow">FAQ</p>
          <h2>Questions people ask at the booth.</h2>
        </div>
        <div className="faq-grid">
          {faqs.map((faq, index) => (
            <article
              className={`faq-item reveal ${index % 2 === 0 ? "from-left" : "from-right"}`}
              style={{ transitionDelay: `${index * 80}ms` }}
              key={faq.question}
            >
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <Link className="brand" href="/">
          <Image src="/ydeck.png" alt="" width={34} height={43} />
          <span>YDeck</span>
        </Link>
        <p>Private AI Presentation Agent</p>
        <button className="primary-action small" onClick={openModal}>Join waitlist</button>
      </footer>

      <WaitlistModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </main>
  );
}
