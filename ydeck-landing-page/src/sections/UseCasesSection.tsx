import type { LocaleContent } from '../i18n/localeContent';
import type { Locale } from '../types';
import { FadeUp } from '../components/Motion';

export function UseCasesSection({
  content,
}: {
  content: LocaleContent[Locale]['useCases'];
}) {
  return (
    <section className="relative scroll-mt-28 px-5 py-16 lg:px-8 lg:py-28" id="use-cases">
      <div className="mx-auto max-w-7xl">
        <FadeUp>
          <h2 className="max-w-[20rem] text-3xl font-semibold leading-tight tracking-[-0.04em] lg:max-w-3xl lg:text-6xl lg:tracking-[-0.05em]">
            {content.title}
          </h2>
        </FadeUp>

        <div className="mt-8 grid max-w-[21rem] gap-3 lg:hidden">
          {content.cards.map(({ title, body, Icon }, index) => (
            <FadeUp key={title} delay={index * 0.04}>
              <article className="group relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-ydeck-card/55 p-4">
                <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-ydeck-cyan/0 blur-3xl transition group-hover:bg-ydeck-cyan/15" />
                <div className="relative flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-ydeck-cyan">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold tracking-[-0.03em] text-white">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-ydeck-muted">
                      {body}
                    </p>
                  </div>
                </div>
              </article>
            </FadeUp>
          ))}
        </div>

        <div className="mt-14 hidden gap-5 lg:grid lg:grid-cols-3">
          {content.cards.map(({ title, body, Icon }, index) => (
            <FadeUp key={title} delay={index * 0.05}>
              <article className="group relative min-h-56 overflow-hidden rounded-3xl border border-white/10 bg-ydeck-card/60 p-6 transition hover:border-cyan-300/30 hover:bg-white/[0.05]">
                <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-ydeck-cyan/0 blur-3xl transition group-hover:bg-ydeck-cyan/20" />
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-ydeck-cyan">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-8 text-2xl font-semibold tracking-[-0.04em]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-ydeck-muted">
                  {body}
                </p>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
