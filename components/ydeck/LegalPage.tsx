import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';

import { legalCopy, type LegalPageKey } from './data/legalPages';
import type { Locale } from './types';
import { localizedPath } from './utils/routes';

export function LegalPage({
  locale,
  pageKey,
}: {
  locale: Locale;
  pageKey: LegalPageKey;
}) {
  const copy = legalCopy[locale];
  const page = copy.pages[pageKey];

  return (
    <main className="ydeck-page min-h-[100dvh] bg-ydeck-black px-5 py-6 text-ydeck-text md:px-8 md:py-8">
      <div className="blueprint-grid fixed inset-0 opacity-20" />
      <div className="noise-overlay fixed inset-0 opacity-20" />
      <div className="radial-glow fixed inset-0" />

      <div className="relative mx-auto max-w-5xl">
        <nav className="flex items-center justify-between gap-4">
          <Link
            href={localizedPath('/', locale)}
            className="glass-panel inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-white transition hover:border-cyan-300/40"
          >
            <ArrowLeft className="h-4 w-4" />
            {copy.back}
          </Link>
          <Link
            href={localizedPath('/', locale)}
            className="flex items-center gap-3"
            aria-label="YDeck home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
              <Image
                src="/ydeck.png"
                alt=""
                width={24}
                height={31}
                className="h-8 w-auto"
                priority
              />
            </span>
            <span className="hidden text-base font-bold text-white sm:inline">
              YDeck
            </span>
          </Link>
        </nav>

        <section className="pt-20 md:pt-28">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ydeck-cyan">
            {page.eyebrow}
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-white md:text-7xl">
            {page.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-ydeck-muted md:text-lg">
            {page.intro}
          </p>
          <p className="mt-5 text-sm text-slate-400">{copy.updated}</p>
        </section>

        <section className="grid gap-4 py-12 md:py-16">
          {page.sections.map((section) => (
            <article
              key={section.title}
              className="rounded-2xl border border-white/10 bg-ydeck-panel/75 p-5 md:p-7"
            >
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">
                {section.title}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-ydeck-muted md:text-base">
                {section.body}
              </p>
            </article>
          ))}
        </section>

        <footer className="border-t border-white/10 py-8 text-sm text-ydeck-muted">
          <a
            href="mailto:hello@ydeck.ai"
            className="inline-flex items-center gap-2 transition hover:text-white"
          >
            <Mail className="h-4 w-4" />
            {copy.contact}
          </a>
        </footer>
      </div>
    </main>
  );
}
