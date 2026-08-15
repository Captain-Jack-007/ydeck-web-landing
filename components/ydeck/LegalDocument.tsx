import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, Mail } from 'lucide-react';
import type { ReactNode } from 'react';

import {
  legalCompany,
  legalDates,
  legalNavigation,
  type LegalSectionLink,
} from './data/legal';

type LegalDocumentProps = {
  activePath: string;
  children: ReactNode;
  description: string;
  sections: readonly LegalSectionLink[];
  title: string;
};

export function LegalDocument({
  activePath,
  children,
  description,
  sections,
  title,
}: LegalDocumentProps) {
  return (
    <div className="legal-document ydeck-page min-h-[100dvh] bg-ydeck-black text-ydeck-text">
      <a className="legal-document__skip-link" href="#legal-content">
        Skip to legal content
      </a>

      <div aria-hidden="true" className="blueprint-grid pointer-events-none fixed inset-0 opacity-15" />
      <div aria-hidden="true" className="noise-overlay pointer-events-none fixed inset-0 opacity-15" />
      <div aria-hidden="true" className="legal-document__glow pointer-events-none fixed inset-0" />

      <header className="relative border-b border-white/10 px-5 py-5 md:px-8">
        <nav
          aria-label="Legal page navigation"
          className="legal-document__nav mx-auto flex max-w-7xl items-center justify-between gap-4"
        >
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-3 rounded-lg text-white transition hover:text-cyan-100"
            aria-label="YDeck home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06]">
              <Image
                src="/ydeck.png"
                alt=""
                width={24}
                height={31}
                className="h-8 w-auto"
                priority
              />
            </span>
            <span className="text-base font-bold text-white">YDeck</span>
          </Link>

          <details className="legal-document__mobile-menu">
            <summary>
              Legal pages
              <ChevronDown aria-hidden="true" className="h-4 w-4" />
            </summary>
            <div className="legal-document__mobile-menu-panel">
              {legalNavigation.map((item) => {
                const active = item.href === activePath;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={active ? 'font-semibold text-white' : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </details>

          <div className="legal-document__top-links text-[13px] text-ydeck-muted sm:text-sm">
            {legalNavigation.map((item) => {
              const active = item.href === activePath;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={active ? 'font-semibold text-white' : 'transition hover:text-white'}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <main id="legal-content" className="relative px-5 pb-16 md:px-8 md:pb-24">
        <header className="mx-auto max-w-7xl border-b border-white/10 py-16 md:py-24">
          <p className="text-sm font-semibold text-ydeck-cyan">Legal</p>
          <h1 className="mt-4 max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-white sm:text-5xl md:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-ydeck-muted md:text-lg md:leading-8">
            {description}
          </p>
          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <div className="flex gap-2">
              <dt className="text-ydeck-muted">Effective date:</dt>
              <dd className="font-medium text-slate-200">
                <time dateTime={legalDates.effective.iso}>{legalDates.effective.display}</time>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-ydeck-muted">Last updated:</dt>
              <dd className="font-medium text-slate-200">
                <time dateTime={legalDates.updated.iso}>{legalDates.updated.display}</time>
              </dd>
            </div>
          </dl>
        </header>

        <div className="mx-auto grid max-w-7xl gap-12 pt-10 lg:grid-cols-[12rem_minmax(0,52rem)] lg:justify-center lg:gap-16 lg:pt-16">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <nav aria-label={`${title} sections`}>
              <p className="text-sm font-semibold text-white">On this page</p>
              <ol className="mt-4 grid gap-2 border-t border-white/10 pt-4 text-sm leading-5 text-ydeck-muted">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a className="inline-flex py-1 transition hover:text-white" href={`#${section.id}`}>
                      {section.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="min-w-0 max-w-[52rem]">{children}</article>
        </div>
      </main>

      <footer className="relative border-t border-white/10 px-5 py-10 text-sm text-ydeck-muted md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-semibold text-white">{legalCompany.legalName}</p>
            <p className="mt-1">{legalCompany.jurisdiction}</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <a
              href={`mailto:${legalCompany.email}`}
              className="inline-flex items-center gap-2 transition hover:text-white"
            >
              <Mail aria-hidden="true" className="h-4 w-4" />
              {legalCompany.email}
            </a>
            <a className="transition hover:text-white" href={legalCompany.businessWebsite}>
              globance.ai
            </a>
            <a className="transition hover:text-white" href={legalCompany.productWebsite}>
              ydeck.app
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function LegalSection({
  children,
  id,
  title,
}: {
  children: ReactNode;
  id: string;
  title: string;
}) {
  const headingId = `${id}-heading`;

  return (
    <section aria-labelledby={headingId} className="legal-document__section scroll-mt-8" id={id}>
      <h2 id={headingId}>{title}</h2>
      <div className="legal-document__prose">{children}</div>
    </section>
  );
}

export function LegalContactDetails() {
  return (
    <address className="legal-document__contact">
      <strong>{legalCompany.legalName}</strong>
      <span>{legalCompany.jurisdiction}</span>
      <span>
        Email:{' '}
        <a href={`mailto:${legalCompany.email}`}>{legalCompany.email}</a>
      </span>
      <span>
        Website: <a href={legalCompany.businessWebsite}>{legalCompany.businessWebsite}</a>
      </span>
      <span>
        YDeck: <a href={legalCompany.productWebsite}>{legalCompany.productWebsite}</a>
      </span>
    </address>
  );
}
