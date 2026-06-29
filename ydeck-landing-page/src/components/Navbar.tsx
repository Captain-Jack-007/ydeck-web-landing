import Image from 'next/image';
import { languageOptions } from '../constants';
import type { LocaleContent } from '../i18n/localeContent';
import type { Locale } from '../types';

export function Navbar({
  content,
  locale,
  onJoinWaitlist,
  onLocaleChange,
}: {
  content: LocaleContent[Locale]['nav'];
  locale: Locale;
  onJoinWaitlist?: (locale: Locale) => void;
  onLocaleChange: (locale: Locale) => void;
}) {
  function handleJoin(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!onJoinWaitlist) return;
    event.preventDefault();
    onJoinWaitlist(locale);
  }

  return (
    <nav className="fixed left-5 right-5 top-4 z-50 rounded-full py-3 lg:left-4 lg:right-4 lg:mx-auto lg:max-w-6xl">
      <div className="glass-panel flex items-center justify-between rounded-full px-3 py-2 lg:px-4">
        <a
          href="#"
          className="flex items-center gap-3"
          aria-label={content.homeLabel}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <Image
              src="/ydeck.png"
              alt=""
              width={22}
              height={28}
              className="h-7 w-auto"
              priority
            />
          </span>
          <span className="text-sm font-bold tracking-[-0.03em] text-white lg:text-base">
            YDeck
          </span>
        </a>

        <div className="hidden items-center gap-6 text-sm text-slate-300 lg:flex">
          {content.links.map(([label, href]) => (
            <a key={label} href={href} className="transition hover:text-white">
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex rounded-full border border-white/10 bg-white/[0.04] p-0.5"
            aria-label={content.languageLabel}
          >
            {languageOptions.map((option) => (
              <button
                key={option.locale}
                type="button"
                onClick={() => onLocaleChange(option.locale)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                  locale === option.locale
                    ? 'bg-white text-ydeck-black'
                    : 'text-slate-300 hover:text-white'
                }`}
                aria-pressed={locale === option.locale}
              >
                {option.label}
              </button>
            ))}
          </div>
          <a
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white lg:inline-flex"
            href="#"
          >
            {content.signIn}
          </a>
          <a
            className="hidden rounded-full bg-white px-4 py-2 text-sm font-semibold text-ydeck-black transition hover:bg-cyan-100 lg:inline-flex"
            href="#final-cta"
            onClick={handleJoin}
          >
            {content.join}
          </a>
        </div>
      </div>
    </nav>
  );
}
