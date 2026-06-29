import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

import { ease } from '../constants';
import type { LocaleContent } from '../i18n/localeContent';
import type { Locale } from '../types';
import { FadeUp } from '../components/Motion';

export function FixedFeatureReveal({
  content,
}: {
  content: LocaleContent[Locale]['product'];
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 88%', 'end 12%'],
  });
  const opacity = useTransform(scrollYProgress, [0.02, 0.08], [0, 1]);
  const mask = useTransform(
    scrollYProgress,
    [0.03, 0.42],
    [
      'linear-gradient(to right, black 0%, transparent 14%)',
      'linear-gradient(to right, black 112%, transparent 126%)',
    ]
  );

  return (
    <div id="product">
      <section className="relative px-5 py-16 lg:hidden">
        <div className="mx-auto max-w-xl">
          <FadeUp>
            <p className="text-sm font-medium text-ydeck-cyan">
              {content.kicker}
            </p>
            <h2 className="mt-3 max-w-[20rem] text-3xl font-semibold leading-tight tracking-[-0.04em] text-white">
              {content.title}
            </h2>
          </FadeUp>

          <div className="mt-8 grid gap-3">
            {content.cards.map(({ title, body, Icon }, index) => (
              <FadeUp key={title} delay={index * 0.06}>
                <article className="glass-panel relative overflow-hidden rounded-[1.35rem] p-5">
                  <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-ydeck-cyan/10 blur-3xl" />
                  <div className="relative flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ydeck-cyan/10 text-ydeck-cyan">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold tracking-[-0.03em] text-white">
                        {title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-ydeck-muted">
                        {body}
                      </p>
                    </div>
                  </div>
                </article>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.18}>
            <p className="mt-6 rounded-[1.25rem] border border-ydeck-cyan/20 bg-ydeck-cyan/10 p-4 text-sm leading-6 text-slate-300">
              {content.note}
            </p>
          </FadeUp>
        </div>
      </section>

      <section
        ref={ref}
        className="relative hidden min-h-[68dvh] px-5 pb-2 pt-14 lg:block lg:min-h-[68dvh] lg:px-8 lg:pt-16"
      >
      <motion.div
        className="sticky top-20 mx-auto max-w-6xl md:top-[14vh]"
        style={{ opacity }}
      >
        <div className="mb-6 text-center md:mb-8">
          <p className="text-sm font-medium text-ydeck-cyan">
            {content.kicker}
          </p>
          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
            {content.title}
          </h2>
        </div>
        <motion.div
          className="grid grid-cols-1 gap-5 md:grid-cols-3"
          style={{ WebkitMaskImage: mask, maskImage: mask }}
        >
          {content.cards.map(({ title, body, Icon }, index) => (
            <motion.article
              key={title}
              className="glass-panel min-h-[260px] rounded-3xl p-8"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: index * 0.08, ease }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ydeck-cyan/10 text-ydeck-cyan shadow-[0_0_30px_rgba(34,211,238,0.22)]">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="mt-10 text-2xl font-semibold tracking-[-0.04em]">
                {title}
              </h2>
              <p className="mt-4 text-sm leading-6 text-ydeck-muted">{body}</p>
            </motion.article>
          ))}
        </motion.div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-6 text-ydeck-muted">
          {content.note}
        </p>
      </motion.div>
      </section>
    </div>
  );
}
