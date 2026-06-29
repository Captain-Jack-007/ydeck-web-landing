import { useEffect, useState } from 'react';
import {
  motion,
  type MotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

import { ease } from '../constants';
import { web3TemplateSlides } from '../data/templates';
import type { LocaleContent } from '../i18n/localeContent';
import type { Locale } from '../types';
import { formatMiniSlideAlt } from '../utils/formatters';
import { TypingPrompt } from './TypingPrompt';

export function DeckCommandCenter({
  slidesY,
  content,
  locale,
}: {
  slidesY: MotionValue<number>;
  content: LocaleContent[Locale]['agent'];
  locale: Locale;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const reduceMotion = useReducedMotion();
  const previewY = useTransform(slidesY, [-90, 0], [-16, 0]);
  const visibleSlideCount = reduceMotion
    ? web3TemplateSlides.length
    : Math.min(web3TemplateSlides.length, activeStep + 1);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const interval = window.setInterval(() => {
      setActiveStep((value) => (value + 1) % content.timelineSteps.length);
    }, 1500);
    return () => window.clearInterval(interval);
  }, [content.timelineSteps.length, reduceMotion]);

  return (
    <>
      <MobileDeckCommandCenter
        activeStep={activeStep}
        content={content}
        locale={locale}
      />
      <div className="glass-panel slide-card-shadow relative hidden min-h-[590px] overflow-hidden rounded-[2rem] p-4 md:p-5 lg:block">
        <div className="blueprint-grid absolute inset-0 opacity-20" />
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-ydeck-cyan/10 blur-3xl" />
        <div className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-white/[0.04] blur-3xl" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/35" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
              <span className="h-2.5 w-2.5 rounded-full bg-ydeck-cyan/65" />
            </div>
            <span className="text-sm font-semibold">{content.title}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-ydeck-green/30 bg-ydeck-green/10 px-3 py-1 text-xs text-ydeck-green">
            <span className="h-2 w-2 animate-pulse rounded-full bg-ydeck-green" />
            {content.status}
          </div>
        </div>

        <div className="relative z-10 mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_190px] xl:grid-cols-[minmax(0,1fr)_220px]">
          <div className="grid min-w-0 gap-4">
            <div className="min-h-[8.5rem] overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-sm leading-6 text-slate-200">
              <TypingPrompt texts={[content.prompt]} speed={24} pause={1300} />
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {content.uploadChips.map(({ label, Icon }, index) => (
                <motion.span
                  key={label}
                  className="inline-flex min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300"
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.12, ease }}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-ydeck-cyan" />
                  <span className="truncate">{label}</span>
                </motion.span>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
              <div className="grid gap-3">
                {content.timelineSteps.map((step, index) => {
                  const completed = index < activeStep;
                  const active = index === activeStep;
                  return (
                    <div
                      key={step}
                      className="grid grid-cols-[2rem_minmax(44px,1fr)_7.5rem] items-center gap-3"
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs ${
                          completed
                            ? 'border-ydeck-green/50 bg-ydeck-green/15 text-ydeck-green'
                            : active
                            ? 'border-ydeck-cyan/70 bg-ydeck-cyan/15 text-ydeck-cyan shadow-[0_0_24px_rgba(34,211,238,0.35)]'
                            : 'border-white/10 bg-white/[0.03] text-slate-500'
                        }`}
                      >
                        {completed ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="h-px bg-white/10">
                        <motion.div
                          className="h-px bg-ydeck-cyan/75"
                          animate={{
                            width: completed || active ? '100%' : '0%',
                          }}
                          transition={{ duration: 0.7, ease }}
                        />
                      </div>
                      <span
                        className={`text-xs ${
                          active ? 'text-white' : 'text-slate-400'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                <span>{content.generated}</span>
                <span>{content.ready}</span>
                <span className="hidden sm:inline">{content.editable}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-ydeck-cyan/75"
                  animate={
                    reduceMotion
                      ? { width: '78%' }
                      : { width: ['8%', '100%', '8%'] }
                  }
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </div>
            </div>
          </div>

          <motion.div
            className="hidden min-w-0 flex-col gap-2 lg:flex"
            style={{ y: reduceMotion ? 0 : previewY }}
          >
            <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
              <p className="truncate text-xs font-semibold text-white">
                {content.previewTitle}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">
                {content.selected}
              </p>
            </div>
            {web3TemplateSlides.map((slide, index) => (
              <TemplateMiniSlide
                key={slide.layout}
                slide={slide}
                index={index}
                isVisible={index < visibleSlideCount}
                locale={locale}
              />
            ))}
            <motion.div
              layout={!reduceMotion}
              className="flex items-center justify-between rounded-2xl border border-ydeck-cyan/20 bg-ydeck-cyan/10 px-3 py-2 text-[10px] text-ydeck-cyan"
            >
              <span>{content.applied}</span>
              <span>{content.flow}</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

function MobileDeckCommandCenter({
  activeStep,
  content,
  locale,
}: {
  activeStep: number;
  content: LocaleContent[Locale]['agent'];
  locale: Locale;
}) {
  const reduceMotion = useReducedMotion();
  const activePreview =
    web3TemplateSlides[activeStep % web3TemplateSlides.length];
  const previewSlides = web3TemplateSlides.slice(0, 4);

  return (
    <div className="glass-panel slide-card-shadow relative w-full overflow-hidden rounded-[1.5rem] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.45)] lg:hidden">
      <div className="blueprint-grid absolute inset-0 opacity-20" />
      <div className="absolute -right-24 -top-20 h-56 w-56 rounded-full bg-ydeck-cyan/15 blur-3xl" />
      <div className="absolute -bottom-28 left-8 h-56 w-56 rounded-full bg-white/[0.05] blur-3xl" />

      <div className="relative z-10 rounded-[1.25rem] border border-white/10 bg-black/35 p-3">
        <div className="flex items-center gap-2">
          <div className="flex shrink-0 gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/35" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
            <span className="h-2.5 w-2.5 rounded-full bg-ydeck-cyan/75" />
          </div>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
            {content.title}
          </span>
        </div>
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-ydeck-green/30 bg-ydeck-green/10 px-2.5 py-1 text-[10px] font-medium text-ydeck-green">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ydeck-green" />
          <span>{content.status}</span>
        </div>

        <div className="mt-3 min-h-[6.75rem] overflow-hidden rounded-2xl border border-white/10 bg-black/45 p-3 font-mono text-xs leading-5 text-slate-200">
          <TypingPrompt texts={[content.prompt]} speed={20} pause={1300} />
        </div>

        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
          {content.uploadChips.slice(0, 4).map(({ label, Icon }, index) => (
            <motion.span
              key={label}
              className="inline-flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-2.5 py-2 text-[11px] text-slate-300"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, ease }}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-ydeck-cyan" />
              <span className="truncate">{label}</span>
            </motion.span>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-3 overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#EFF3F8]">
        <motion.img
          key={activePreview.src}
          src={activePreview.src}
          alt={formatMiniSlideAlt(activePreview, locale)}
          className="aspect-video w-full object-cover"
          initial={reduceMotion ? false : { opacity: 0.35, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease }}
          loading="eager"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,5,10,0)_42%,rgba(3,5,10,0.62)_100%)]" />
        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">
              {content.previewTitle}
            </p>
            <p className="mt-1 text-[10px] text-white/70">{content.selected}</p>
          </div>
          <span className="shrink-0 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[10px] font-semibold text-ydeck-cyan">
            {activePreview.number}
          </span>
        </div>
      </div>

      <div className="relative z-10 mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {previewSlides.map((slide, index) => {
          const active = slide.src === activePreview.src;
          return (
            <div
              key={slide.src}
              className={`relative h-12 w-20 shrink-0 overflow-hidden rounded-lg border bg-[#EFF3F8] ${
                active ? 'border-ydeck-cyan' : 'border-white/15 opacity-70'
              }`}
            >
              <img
                src={slide.src}
                alt=""
                className="h-full w-full object-cover"
                loading="eager"
              />
              <span className="absolute left-1.5 top-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
          );
        })}
      </div>

      <div className="relative z-10 mt-3 rounded-[1.1rem] border border-white/10 bg-black/35 p-3">
        <div className="flex items-center justify-between gap-3 text-[11px] text-slate-300">
          <span>{content.generated}</span>
          <span className="text-ydeck-cyan">{content.ready}</span>
        </div>
        <div className="mt-3 grid gap-2">
          {content.timelineSteps.slice(0, 3).map((step, index) => {
            const active = index === activeStep % 3;
            return (
              <div
                key={step}
                className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2"
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] ${
                    active
                      ? 'border-ydeck-cyan/70 bg-ydeck-cyan/15 text-ydeck-cyan'
                      : 'border-white/10 bg-white/[0.03] text-slate-500'
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={
                    active ? 'text-xs text-white' : 'text-xs text-slate-500'
                  }
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TemplateMiniSlide({
  slide,
  index,
  isVisible,
  locale,
}: {
  slide: (typeof web3TemplateSlides)[number];
  index: number;
  isVisible: boolean;
  locale: Locale;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden={!isVisible}
      className={`group relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-[#EFF3F8] shadow-[0_18px_42px_rgba(0,0,0,0.32)] ${
        isVisible ? '' : 'pointer-events-none'
      }`}
      initial={
        reduceMotion ? false : { opacity: 0, y: 12, filter: 'blur(6px)' }
      }
      animate={
        isVisible
          ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
          : { opacity: 0, y: 14, scale: 0.98, filter: 'blur(6px)' }
      }
      transition={{
        duration: reduceMotion ? 0 : 0.36,
        delay: isVisible && index > 0 ? 0.06 : 0,
        ease,
      }}
      whileHover={isVisible ? { scale: 1.04 } : undefined}
    >
      <img
        src={slide.src}
        alt={formatMiniSlideAlt(slide, locale)}
        className="h-full w-full origin-top scale-[1.17] object-contain"
        loading="eager"
      />
    </motion.div>
  );
}
