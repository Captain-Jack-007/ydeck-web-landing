import Image from 'next/image';
import { ArrowRight, FileText } from 'lucide-react';

import type { LocaleContent } from '../i18n/localeContent';
import type { Locale } from '../types';
import { TypingPrompt } from '../components/TypingPrompt';

export function Footer({
  content,
  homeLabel,
  locale,
  onJoinWaitlist,
}: {
  content: LocaleContent[Locale]['footer'];
  homeLabel: string;
  locale: Locale;
  onJoinWaitlist?: (locale: Locale) => void;
}) {
  function handleJoin(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!onJoinWaitlist) return;
    event.preventDefault();
    onJoinWaitlist(locale);
  }

  return (
    <footer className="relative overflow-hidden border-t border-white/10 px-5 pb-10 pt-12 md:px-8 md:pb-12 md:pt-14">
      <div className="blueprint-grid absolute inset-0 opacity-20" />
      <div className="noise-overlay absolute inset-0 opacity-20" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ydeck-cyan/50 to-transparent" />
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-ydeck-cyan/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ydeck-cyan">
              {content.kicker}
            </p>
            <h2 className="mt-3 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.06em] text-white md:text-6xl">
              {content.title}
            </h2>
          </div>
          <div className="glass-panel rounded-3xl p-4">
            <div className="flex items-center gap-3 text-sm font-semibold text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-ydeck-cyan">
                <FileText className="h-4 w-4" />
              </span>
              {content.promptTitle}
            </div>
            <div className="mt-4 flex min-h-[5.25rem] items-start rounded-2xl border border-white/10 bg-black/35 p-3 font-mono text-xs leading-5 text-slate-300 md:min-h-[4.25rem]">
              <TypingPrompt texts={[content.prompt]} speed={28} pause={1400} />
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_1.85fr] lg:items-stretch">
          <div className="glass-panel relative overflow-hidden rounded-[1.75rem] p-6 md:p-8">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/[0.06] blur-2xl" />
            <a
              href="#"
              className="relative flex items-center gap-3"
              aria-label={homeLabel}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <Image
                  src="/ydeck.png"
                  alt=""
                  width={27}
                  height={35}
                  className="h-8 w-auto"
                />
              </span>
              <span className="text-2xl font-semibold tracking-[-0.05em] text-white">
                YDeck
              </span>
            </a>

            <p className="relative mt-6 max-w-sm text-sm leading-6 text-ydeck-muted">
              {content.body}
            </p>

            <div className="relative mt-8 grid grid-cols-3 gap-2">
              {content.stats.map(([value, label]) => (
                <div
                  key={value}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-4"
                >
                  <p className="text-lg font-semibold tracking-[-0.04em] text-white">
                    {value}
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-ydeck-muted">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <a
              href="#final-cta"
              onClick={handleJoin}
              className="relative mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-ydeck-black transition hover:bg-cyan-100"
            >
              {content.cta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-ydeck-panel/70 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.32)] backdrop-blur md:p-8">
            <div className="grid gap-8 md:grid-cols-3">
              {content.links.map(({ title, links }) => (
                <div key={title}>
                  <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-ydeck-cyan">
                    {title}
                  </h4>
                  <div className="mt-5 grid gap-3 text-sm text-ydeck-muted">
                    {links.map(([label, href]) => (
                      <a
                        key={label}
                        href={href}
                        onClick={href === '#final-cta' ? handleJoin : undefined}
                        className="transition hover:text-white"
                      >
                        {label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-4 border-t border-white/10 pt-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-semibold text-white">
                  {content.closingTitle}
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-ydeck-muted">
                  {content.closingBody}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                {content.badges.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-ydeck-muted md:flex-row md:items-center md:justify-between">
          <p>{content.copyright}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {content.legal.map((item, index) => (
              <a
                key={item}
                href={index === 2 ? '#privacy' : '#'}
                className="transition hover:text-white"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
