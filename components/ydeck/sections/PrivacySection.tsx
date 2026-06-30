import { motion, useReducedMotion } from 'framer-motion';
import { Cpu, FileText, Lock } from 'lucide-react';

import type { LocaleContent } from '../i18n/localeContent';
import type { Locale } from '../types';
import { FadeUp } from '../components/Motion';

export function PrivacySection({
  content,
}: {
  content: LocaleContent[Locale]['privacy'];
}) {
  return (
    <section className="relative bg-ydeck-dark px-5 py-28 md:px-8" id="privacy">
      <div className="noise-overlay absolute inset-0 opacity-20" />
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
        <FadeUp>
          <h2 className="max-w-2xl text-4xl font-semibold tracking-[-0.05em] md:text-6xl">
            {content.title}
          </h2>
          <p className="mt-6 max-w-xl leading-7 text-ydeck-muted">
            {content.body}
          </p>
          <div className="mt-8 grid gap-3">
            {content.bullets.map(([text, Icon]) => (
              <div
                key={text}
                className="flex items-center gap-3 text-sm text-slate-300"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-ydeck-cyan">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </div>
            ))}
          </div>
        </FadeUp>
        <PrivacyVisual content={content} />
      </div>
    </section>
  );
}

function PrivacyVisual({
  content,
}: {
  content: LocaleContent[Locale]['privacy'];
}) {
  return (
    <FadeUp>
      <MobilePrivacyVisual content={content} />
      <DesktopPrivacyVisual content={content} />
    </FadeUp>
  );
}

function MobilePrivacyVisual({
  content,
}: {
  content: LocaleContent[Locale]['privacy'];
}) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="glass-panel relative overflow-hidden rounded-[1.75rem] p-5 lg:hidden">
      <div className="blueprint-grid absolute inset-0 opacity-20" />
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-ydeck-cyan/12 blur-3xl" />

      <div className="relative grid gap-2">
        {content.files.map((file, index) => (
          <motion.div
            key={file}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300"
            initial={reduceMotion ? false : { opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
          >
            <FileText className="h-4 w-4 shrink-0 text-ydeck-cyan" />
            <span className="truncate">{file}</span>
          </motion.div>
        ))}
      </div>

      <div className="relative mt-5 flex items-center justify-center gap-3">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-ydeck-cyan/40" />
        <motion.div
          className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-ydeck-cyan/30 bg-ydeck-cyan/10 text-ydeck-cyan"
          animate={
            reduceMotion
              ? undefined
              : {
                  boxShadow: [
                    '0 0 12px rgba(34,211,238,0.2)',
                    '0 0 36px rgba(34,211,238,0.45)',
                    '0 0 12px rgba(34,211,238,0.2)',
                  ],
                }
          }
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Lock className="h-6 w-6" />
          <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-xl border border-ydeck-cyan/35 bg-ydeck-black text-ydeck-cyan">
            <Cpu className="h-3.5 w-3.5" />
          </span>
        </motion.div>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-ydeck-cyan/40" />
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-2">
        {content.slides.map((slide, index) => (
          <motion.div
            key={slide}
            className="aspect-video rounded-xl border border-white/10 bg-white/[0.06] p-2 text-[10px] text-slate-300"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45, delay: 0.25 + index * 0.08 }}
          >
            <p className="truncate">{slide}</p>
            <span className="mt-2 block h-1 rounded-full bg-white/55" />
            <span className="mt-1 block h-1 w-2/3 rounded-full bg-white/25" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DesktopPrivacyVisual({
  content,
}: {
  content: LocaleContent[Locale]['privacy'];
}) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="glass-panel relative hidden min-h-[460px] overflow-hidden rounded-[2rem] p-6 lg:block">
      <div className="blueprint-grid absolute inset-0 opacity-20" />
      <motion.div
        className="absolute left-1/2 top-12 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-2xl border border-ydeck-cyan/30 bg-ydeck-cyan/10 text-ydeck-cyan"
        animate={
          reduceMotion
            ? undefined
            : {
                boxShadow: [
                  '0 0 12px rgba(34,211,238,0.2)',
                  '0 0 42px rgba(34,211,238,0.48)',
                  '0 0 12px rgba(34,211,238,0.2)',
                ],
              }
        }
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Lock className="h-7 w-7" />
      </motion.div>
      <div className="absolute inset-x-8 bottom-8 top-28 rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
        <div className="mx-auto mt-16 flex h-24 w-24 items-center justify-center rounded-full border border-ydeck-cyan/30 bg-ydeck-cyan/10 text-ydeck-cyan">
          <Cpu className="h-10 w-10" />
        </div>
        {content.files.map((file, index) => (
          <motion.div
            key={file}
            className="absolute left-6 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300"
            style={{ top: 54 + index * 72 }}
            animate={
              reduceMotion
                ? undefined
                : { x: [0, 36, 0], opacity: [0.65, 1, 0.65] }
            }
            transition={{
              duration: 3.2,
              repeat: Infinity,
              delay: index * 0.5,
            }}
          >
            <FileText className="h-4 w-4 text-ydeck-cyan" />
            {file}
          </motion.div>
        ))}
        {content.slides.map((slide, index) => (
          <motion.div
            key={slide}
            className="absolute right-6 aspect-video w-28 rounded-xl border border-white/10 bg-white/[0.06] p-2 text-[10px]"
            style={{ top: 52 + index * 72 }}
            animate={
              reduceMotion ? undefined : { x: [20, 0], opacity: [0.35, 1] }
            }
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatDelay: 3,
              delay: index * 0.45,
            }}
          >
            <p>{slide}</p>
            <span className="mt-4 block h-1 rounded-full bg-white/50" />
            <span className="mt-1 block h-1 w-2/3 rounded-full bg-white/25" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
