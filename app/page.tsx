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
  GraduationCap,
  Laptop,
  Layers3,
  LockKeyhole,
  Menu,
  MessageSquareText,
  Presentation,
  Rocket,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
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

      <section className="hero section-band">
        <div className="hero-copy reveal">
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
        </div>

        <div className="hero-visual reveal delay-1" aria-label="Prompt to YDeck to PPTX visual">
          <div className="flow-node prompt-node">
            <MessageSquareText size={22} />
            <span>Create a 10-slide investor pitch deck for my startup</span>
          </div>
          <div className="flow-arrow" />
          <div className="agent-core">
            <div className="agent-ring" />
            <Image src="/ydeck.png" alt="YDeck logo" width={104} height={132} priority />
            <span>YDeck AI Agent</span>
          </div>
          <div className="flow-arrow" />
          <div className="flow-node output-node">
            <Download size={22} />
            <span>Download polished PPTX</span>
          </div>
          <div className="mini-deck deck-a" />
          <div className="mini-deck deck-b" />
        </div>
      </section>

      <section className="problem-section" id="problem">
        <div className="section-heading reveal">
          <p className="eyebrow">The problem</p>
          <h2>Presentation work is still too manual.</h2>
        </div>
        <div className="problem-grid">
          {problems.map((problem, index) => (
            <article className="problem-item reveal" style={{ animationDelay: `${index * 80}ms` }} key={problem}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{problem}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="solution-section section-band" id="solution">
        <div className="section-heading reveal">
          <p className="eyebrow"><Sparkles size={16} /> The solution</p>
          <h2>Turn ideas, documents, or notes into structured, branded presentations.</h2>
          <p>
            YDeck plans the story, organizes the slide outline, and prepares a clean design direction
            before you export.
          </p>
        </div>
        <div className="use-case-grid">
          {useCases.map(({ title, icon: Icon, text }) => (
            <article className="use-case-card reveal" key={title}>
              <div className="card-icon"><Icon size={22} /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="modes-section" id="modes">
        <div className="section-heading reveal">
          <p className="eyebrow">Choose how your AI works</p>
          <h2>Private Agent for sensitive work. Cloud Agent for speed.</h2>
        </div>
        <div className="mode-grid">
          <article className="mode-panel private-mode reveal">
            <div className="mode-top">
              <Laptop size={28} />
              <h3>Private Agent</h3>
            </div>
            <ul>
              <li><Check size={18} /> Runs locally on your computer</li>
              <li><Check size={18} /> Keeps sensitive files on your device</li>
              <li><Check size={18} /> Best for confidential decks</li>
            </ul>
          </article>
          <article className="mode-panel cloud-mode reveal delay-1">
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
        <div className="section-heading reveal">
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
              <article className="workflow-step reveal" key={title as string}>
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
        <div className="pilot-copy reveal">
          <p className="eyebrow"><BadgeCheck size={16} /> Pilot program</p>
          <h2>Join the YDeck Pilot Program</h2>
          <p>
            We are inviting selected founders, educators, consultants, companies, and organizations
            to test YDeck before public launch.
          </p>
          <div className="benefit-list">
            {pilotBenefits.map((benefit) => (
              <span key={benefit}><Check size={16} /> {benefit}</span>
            ))}
          </div>
          <Link className="secondary-action standalone-link" href="/waitlist">
            Open dedicated waitlist page <ArrowRight size={18} />
          </Link>
        </div>
        <div className="pilot-form-shell reveal delay-1">
          <WaitlistForm />
        </div>
      </section>

      <section className="faq-section section-band" id="faq">
        <div className="section-heading reveal">
          <p className="eyebrow">FAQ</p>
          <h2>Questions people ask at the booth.</h2>
        </div>
        <div className="faq-grid">
          {faqs.map((faq) => (
            <article className="faq-item reveal" key={faq.question}>
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
