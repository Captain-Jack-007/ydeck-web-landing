import { motion } from 'framer-motion';

import { ease } from '../constants';
import type { LocaleContent } from '../i18n/localeContent';
import type { Locale } from '../types';
import { FadeUp } from '../components/Motion';

export function WorkflowSection({
  content,
}: {
  content: LocaleContent[Locale]['workflow'];
}) {
  return (
    <section
      className="relative scroll-mt-28 px-5 pb-16 pt-10 lg:px-8 lg:pb-28 lg:pt-12"
      id="workflow"
    >
      <div className="mx-auto max-w-7xl">
        <FadeUp>
          <h2 className="text-3xl font-semibold leading-tight tracking-[-0.04em] lg:max-w-3xl lg:text-6xl lg:tracking-[-0.05em]">
            {content.title}
          </h2>
          <p className="mt-4 text-sm leading-6 text-ydeck-muted lg:mt-5 lg:max-w-2xl lg:text-base">
            {content.body}
          </p>
        </FadeUp>

        <div className="mt-8 grid gap-3 lg:hidden">
          {content.steps.map(({ title, body, Icon }, index) => (
            <FadeUp key={title} delay={index * 0.05}>
              <article className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-ydeck-panel/70 p-4">
                <div className="absolute -right-14 -top-14 h-28 w-28 rounded-full bg-ydeck-cyan/10 blur-3xl" />
                <div className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
                  <div className="flex flex-col items-center">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-ydeck-cyan/35 bg-ydeck-cyan/10 text-xs font-semibold text-ydeck-cyan">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {index < content.steps.length - 1 && (
                      <span className="mt-2 h-14 w-px bg-gradient-to-b from-ydeck-cyan/45 to-white/5" />
                    )}
                  </div>
                  <div className="min-w-0 pb-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-ydeck-cyan">
                        <Icon className="h-4 w-4" />
                      </span>
                      <h3 className="text-base font-semibold text-white">
                        {title}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-ydeck-muted">
                      {body}
                    </p>
                  </div>
                </div>
              </article>
            </FadeUp>
          ))}
        </div>

        <div className="relative mt-16 hidden items-stretch gap-5 lg:grid lg:grid-cols-5">
          <motion.div
            className="absolute left-0 top-14 hidden h-px bg-ydeck-cyan/45 lg:block"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.2, ease }}
            style={{ transformOrigin: 'left', width: '100%' }}
          />
          {content.steps.map(({ title, body, Icon }, index) => (
            <FadeUp key={title} delay={index * 0.08} className="h-full">
              <article className="glass-panel relative flex h-full min-h-80 flex-col rounded-3xl p-6">
                <p className="text-5xl font-semibold tracking-[-0.08em] text-white/12">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-ydeck-cyan">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-8 text-xl font-semibold">{title}</h3>
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
