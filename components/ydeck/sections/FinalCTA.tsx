import type { LocaleContent } from '../i18n/localeContent';
import type { Locale } from '../types';
import { FadeUp } from '../components/Motion';
import { TypingPrompt } from '../components/TypingPrompt';

export function FinalCTA({
  content,
  locale,
  onJoinWaitlist,
}: {
  content: LocaleContent[Locale]['finalCta'];
  locale: Locale;
  onJoinWaitlist?: (locale: Locale) => void;
}) {
  function handleJoin(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!onJoinWaitlist) return;
    event.preventDefault();
    onJoinWaitlist(locale);
  }

  return (
    <section
      id="final-cta"
      className="relative scroll-mt-28 overflow-hidden px-5 pb-12 pt-20 md:px-8 md:pb-14 md:pt-24"
    >
      <div className="noise-overlay absolute inset-0 opacity-25" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(34,211,238,0.12),transparent_34%),radial-gradient(circle_at_60%_70%,rgba(255,255,255,0.05),transparent_34%)]" />
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <FadeUp>
          <p className="text-sm uppercase tracking-[0.2em] text-ydeck-cyan">
            {content.kicker}
          </p>
          <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.06em] md:text-6xl">
            {content.title}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl leading-7 text-ydeck-muted">
            {content.body}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-ydeck-black transition hover:bg-slate-200"
              href="#"
              onClick={handleJoin}
            >
              {content.primary}
            </a>
            <a
              className="glass-panel rounded-full px-6 py-3 text-sm font-semibold text-white"
              href="#templates"
            >
              {content.secondary}
            </a>
          </div>
          <div className="glass-panel mx-auto mt-8 flex min-h-[5.5rem] max-w-xl items-start rounded-2xl p-4 text-left font-mono text-sm leading-6 text-slate-300 md:min-h-[4.5rem]">
            <TypingPrompt texts={[content.prompt]} />
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
