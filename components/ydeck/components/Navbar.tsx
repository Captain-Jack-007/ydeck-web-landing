import Image from 'next/image';
import { languageOptions } from '../constants';
import type { LocaleContent } from '../i18n/localeContent';
import type { Locale } from '../types';
import { localizedPath } from '../utils/routes';

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
    <nav className="fixed left-3 right-3 top-4 z-50 rounded-full py-3 sm:left-5 sm:right-5 lg:left-4 lg:right-4 lg:mx-auto lg:max-w-6xl xl:max-w-7xl">
      <div className="glass-panel flex items-center justify-between rounded-full px-2 py-2 sm:px-3 lg:px-4">
        <a
          href={localizedPath('/', locale)}
          className="flex items-center gap-2 sm:gap-3"
          aria-label={content.homeLabel}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:h-9 sm:w-9">
            <Image
              src="/ydeck.png"
              alt=""
              width={22}
              height={28}
              className="h-6 w-auto sm:h-7"
              priority
            />
          </span>
          <span className="text-xs font-bold tracking-[-0.03em] text-white sm:text-sm lg:text-base">
            YDeck
          </span>
        </a>

        <div className="hidden items-center gap-4 text-sm text-slate-300 xl:flex 2xl:gap-6">
          {content.links.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="whitespace-nowrap transition hover:text-white"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            className="flex rounded-full border border-white/10 bg-white/[0.04] p-0.5"
            aria-label={content.languageLabel}
          >
            {languageOptions.map((option) => (
              <button
                key={option.locale}
                type="button"
                onClick={() => onLocaleChange(option.locale)}
                className={`rounded-full px-2 py-1 text-[10px] font-semibold transition sm:px-2.5 sm:text-[11px] ${
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
            className="inline-flex whitespace-nowrap rounded-full bg-white px-3 py-2 text-xs font-semibold text-ydeck-black transition hover:bg-cyan-100 sm:px-4 sm:text-sm"
            href={localizedPath('/waitlist', locale)}
            onClick={handleJoin}
          >
            {content.join}
          </a>
        </div>
      </div>
    </nav>
  );
}
