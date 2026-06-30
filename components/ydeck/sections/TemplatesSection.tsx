import type { CSSProperties } from 'react';

import { makeTemplateSlides } from '../data/templates';
import type { LocaleContent } from '../i18n/localeContent';
import type { Locale } from '../types';
import { formatSlideCount, formatTemplatePreviewAlt } from '../utils/formatters';
import { FadeUp } from '../components/Motion';

export function TemplatesSection({
  content,
  locale,
}: {
  content: LocaleContent[Locale]['templates'];
  locale: Locale;
}) {
  const doubled = [...content.items, ...content.items];
  return (
    <section className="relative px-5 py-28 md:px-8" id="templates">
      <div className="mx-auto max-w-7xl">
        <FadeUp>
          <h2 className="max-w-3xl text-4xl font-semibold tracking-[-0.05em] md:text-6xl">
            {content.title}
          </h2>
          <p className="mt-5 max-w-3xl leading-7 text-ydeck-muted">
            {content.body}
          </p>
        </FadeUp>
      </div>
      <div className="relative mt-12 overflow-hidden py-2">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ydeck-black to-transparent md:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ydeck-black to-transparent md:w-24" />
        <div className="template-marquee flex w-max gap-4 pl-16 md:pl-24">
          {doubled.map((template, index) => (
            <TemplateCard
              key={`${template.title}-${index}`}
              {...template}
              realPreviewLabel={content.realPreview}
              locale={locale}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TemplateCard({
  title,
  slides,
  tag,
  previewSlides,
  realPreviewLabel,
  locale,
}: {
  title: string;
  slides: string;
  tag: string;
  previewSlides?: ReturnType<typeof makeTemplateSlides>;
  realPreviewLabel: string;
  locale: Locale;
}) {
  const primaryPreview = previewSlides?.[0];
  const carouselSlides = previewSlides ?? [];
  const carouselWidth = Math.max(0, carouselSlides.length * 3.875 - 13.25);

  return (
    <article className="group w-[min(78vw,17rem)] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-ydeck-panel/80 p-3 transition hover:-translate-y-1 hover:border-cyan-300/35 md:w-64">
      {primaryPreview ? (
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-white/10 bg-[#EFF3F8]">
          <img
            src={primaryPreview.src}
            alt={formatTemplatePreviewAlt(title, primaryPreview.number, locale)}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,5,10,0)_45%,rgba(3,5,10,0.34)_100%)]" />
          <div className="absolute inset-x-2 bottom-2 overflow-hidden rounded-lg">
            <div
              className="template-preview-strip flex w-max gap-1.5"
              style={
                {
                  '--template-preview-distance': `-${carouselWidth}rem`,
                  '--template-preview-duration': `${Math.max(
                    8,
                    carouselSlides.length * 1.2
                  )}s`,
                } as CSSProperties
              }
            >
              {carouselSlides.map((preview, index) => (
                <span
                  key={`${preview.src}-${index}`}
                  className="relative h-8 w-14 shrink-0 overflow-hidden rounded border border-white/35 bg-white shadow-[0_6px_12px_rgba(0,0,0,0.22)]"
                >
                  <img
                    src={preview.src}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </span>
              ))}
            </div>
          </div>
          <span className="absolute right-2 top-2 rounded-full border border-black/10 bg-white/90 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-700">
            {realPreviewLabel}
          </span>
          <span className="absolute bottom-12 right-2 rounded-full bg-black/45 px-2 py-1 text-[9px] font-semibold text-white/90">
            {formatSlideCount(carouselSlides.length, locale)}
          </span>
        </div>
      ) : (
        <div className="aspect-[16/9] overflow-hidden rounded-xl border border-white/10 bg-white/[0.05] p-3">
          <div className="grid h-full grid-cols-3 gap-2">
            <span className="col-span-1 rounded-lg bg-white/15" />
            <span className="col-span-2 grid content-center gap-2">
              <span className="h-1.5 rounded-full bg-white/60" />
              <span className="h-1.5 w-4/5 rounded-full bg-white/35" />
              <span className="h-1.5 w-2/3 rounded-full bg-white/20" />
            </span>
          </div>
        </div>
      )}
      <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-ydeck-cyan">
        {tag}
      </p>
      <h3 className="mt-2 min-h-[3.25rem] text-lg font-semibold leading-tight tracking-[-0.03em]">
        {title}
      </h3>
      <p className="mt-2 text-sm text-ydeck-muted">{slides}</p>
    </article>
  );
}
