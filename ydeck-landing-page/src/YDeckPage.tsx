import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { ArrowRight, PlayCircle, Sparkles } from 'lucide-react';

import { DeckCommandCenter } from './components/DeckCommandCenter';
import { HeroBackground } from './components/HeroBackground';
import { FadeUp, WordsPullUp } from './components/Motion';
import { Navbar } from './components/Navbar';
import { ParticleCanvas } from './components/ParticleCanvas';
import { localeContent } from './i18n/localeContent';
import { FinalCTA } from './sections/FinalCTA';
import { Footer } from './sections/Footer';
import { FixedFeatureReveal } from './sections/ProductSection';
import { PrivacySection } from './sections/PrivacySection';
import { TemplatesSection } from './sections/TemplatesSection';
import { UseCasesSection } from './sections/UseCasesSection';
import { WorkflowSection } from './sections/WorkflowSection';
import type { Locale } from './types';
import { detectInitialLocale } from './utils/locale';

type YDeckPageProps = {
  onJoinWaitlist?: (locale: Locale) => void;
};

export function YDeckPage({ onJoinWaitlist }: YDeckPageProps) {
  const [locale, setLocale] = useState<Locale>(detectInitialLocale);
  const content = localeContent[locale];
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const visualScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const slidesY = useTransform(scrollYProgress, [0, 1], [0, -90]);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem('ydeck-locale', locale);
  }, [locale]);

  return (
    <main className="ydeck-page min-h-[100dvh] overflow-hidden bg-ydeck-black text-ydeck-text">
      <HeroBackground gridY={gridY} />
      <ParticleCanvas />
      <Navbar
        content={content.nav}
        locale={locale}
        onJoinWaitlist={onJoinWaitlist}
        onLocaleChange={setLocale}
      />

      <section
        ref={heroRef}
        className="relative px-5 pb-14 pt-28 lg:min-h-[115dvh] lg:px-10 lg:pb-24 lg:pt-32"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 lg:min-h-[88dvh] lg:grid-cols-12 lg:gap-12">
          <motion.div
            className="relative z-10 min-w-0 max-w-full lg:col-span-6"
            style={{
              opacity: reduceMotion ? 1 : heroOpacity,
              y: reduceMotion ? 0 : heroY,
            }}
          >
            <FadeUp>
              <div className="glass-panel inline-flex items-center gap-2 rounded-full border-cyan-400/30 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ydeck-cyan lg:px-4 lg:text-xs lg:tracking-[0.18em]">
                <Sparkles className="h-4 w-4" />
                <span className="truncate">{content.hero.eyebrow}</span>
              </div>
            </FadeUp>

            <WordsPullUp
              text={content.hero.title}
              highlightWords={[...content.hero.highlightWords]}
              className="mt-6 text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-ydeck-text lg:max-w-4xl lg:text-8xl lg:leading-[0.94] lg:tracking-[-0.04em]"
            />

            <FadeUp delay={0.45}>
              <p className="mt-5 text-sm leading-[1.75] text-ydeck-muted lg:mt-6 lg:max-w-xl lg:text-lg">
                {content.hero.body}
              </p>
            </FadeUp>

            <FadeUp delay={0.62}>
              <div className="mt-7 flex flex-col gap-3 lg:mt-8 lg:flex-row">
                <motion.a
                  href="#final-cta"
                  onClick={(event) => {
                    if (!onJoinWaitlist) return;
                    event.preventDefault();
                    onJoinWaitlist(locale);
                  }}
                  whileHover={{ scale: 1.03 }}
                  className="group inline-flex min-h-11 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-ydeck-black shadow-[0_18px_50px_rgba(255,255,255,0.12)] transition hover:bg-slate-200 lg:min-h-12 lg:w-auto lg:px-6"
                >
                  {content.hero.primaryCta}
                  <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                </motion.a>
                <motion.a
                  href="#templates"
                  whileHover={{ scale: 1.03 }}
                  className="glass-panel inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition hover:border-cyan-300/40 lg:min-h-12 lg:w-auto lg:px-6"
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  {content.hero.secondaryCta}
                </motion.a>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-400 lg:max-w-xl">
                {content.hero.note}
              </p>
            </FadeUp>
          </motion.div>

          <motion.div
            className="relative z-10 w-full min-w-0 lg:col-span-6"
            style={{ scale: reduceMotion ? 1 : visualScale }}
          >
            <DeckCommandCenter
              slidesY={slidesY}
              content={content.agent}
              locale={locale}
            />
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-9 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center text-xs text-slate-400 md:flex"
          animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span>{content.hero.scroll}</span>
          <ArrowRight className="mt-2 h-5 w-5 rotate-90 opacity-60" />
        </motion.div>
      </section>

      <FixedFeatureReveal content={content.product} />
      <WorkflowSection content={content.workflow} />
      <UseCasesSection content={content.useCases} />
      <PrivacySection content={content.privacy} />
      <TemplatesSection content={content.templates} locale={locale} />
      <FinalCTA
        content={content.finalCta}
        locale={locale}
        onJoinWaitlist={onJoinWaitlist}
      />
      <Footer
        content={content.footer}
        homeLabel={content.nav.homeLabel}
        locale={locale}
        onJoinWaitlist={onJoinWaitlist}
      />
    </main>
  );
}
