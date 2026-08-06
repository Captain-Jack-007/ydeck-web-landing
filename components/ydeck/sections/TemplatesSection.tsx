'use client';

import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';

import { FadeUp } from '../components/Motion';
import { contactHref } from '../constants';
import { getFallbackReportTemplates } from '../data/reportTemplateFallback';
import type { LocaleContent } from '../i18n/localeContent';
import type { Locale } from '../types';
import { localizedPath } from '../utils/routes';
import {
  getReportTemplates,
  toReportTemplateLocale,
  type LandingReportTemplatesPayload,
  type ReportTemplateCta,
  type ReportTemplateImage,
  type ReportTemplateSummary,
} from '@/src/api/report-templates';

type TemplatesContent = LocaleContent[Locale]['templates'];

type TemplatesSectionProps = {
  content: TemplatesContent;
  initialReportTemplates: LandingReportTemplatesPayload;
  locale: Locale;
  onJoinWaitlist?: (locale: Locale) => void;
};

type TemplateLoadState = {
  locale: ReturnType<typeof toReportTemplateLocale>;
  items: ReportTemplateSummary[];
  source: LandingReportTemplatesPayload['source'];
  status: 'ready' | 'loading';
};

export function TemplatesSection({
  content,
  initialReportTemplates,
  locale,
  onJoinWaitlist,
}: TemplatesSectionProps) {
  const apiLocale = toReportTemplateLocale(locale);
  const [templatesState, setTemplatesState] = useState<TemplateLoadState>({
    locale: initialReportTemplates.locale,
    items: initialReportTemplates.items,
    source: initialReportTemplates.source,
    status: 'ready',
  });

  useEffect(() => {
    let canceled = false;

    if (templatesState.locale === apiLocale) {
      return undefined;
    }

    setTemplatesState((current) => ({
      ...current,
      locale: apiLocale,
      items: [],
      status: 'loading',
    }));

    getReportTemplates({ locale: apiLocale, featured: true, limit: 6 })
      .then((response) => {
        if (canceled) return;
        setTemplatesState({
          locale: apiLocale,
          items: response.items,
          source: 'api',
          status: 'ready',
        });
      })
      .catch((error) => {
        if (canceled) return;
        console.warn(
          '[landing] Report templates catalog unavailable after locale change; rendering fallback catalog.',
          error instanceof Error ? error.message : 'Unknown error'
        );
        setTemplatesState({
          locale: apiLocale,
          items: getFallbackReportTemplates(locale),
          source: 'fallback',
          status: 'ready',
        });
      });

    return () => {
      canceled = true;
    };
    // Fetch only when the selected landing-page locale changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiLocale, locale]);

  const items = templatesState.items;
  const doubled = useMemo(() => [...items, ...items], [items]);
  const isLoading = templatesState.status === 'loading';
  const hasItems = items.length > 0;

  return (
    <section
      aria-busy={isLoading}
      aria-label={content.ariaLabel}
      className="relative px-5 py-28 md:px-8"
      id="reporting-skills"
    >
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

      <div className="relative mt-12 min-h-[28rem] overflow-hidden py-2">
        {isLoading ? (
          <TemplateSkeletonGrid content={content} />
        ) : hasItems ? (
          <>
            {templatesState.source === 'fallback' ? (
              <p className="sr-only" role="status">
                {content.fallbackNotice}
              </p>
            ) : null}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ydeck-black to-transparent md:w-24" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ydeck-black to-transparent md:w-24" />
            <div className="template-marquee flex w-max gap-4 pl-16 md:pl-24">
              {doubled.map((template, index) => (
                <TemplateCard
                  key={`${template.id}-${index}`}
                  content={content}
                  locale={locale}
                  onJoinWaitlist={onJoinWaitlist}
                  template={template}
                />
              ))}
            </div>
          </>
        ) : (
          <TemplateEmptyState
            content={content}
            locale={locale}
            onJoinWaitlist={onJoinWaitlist}
          />
        )}
      </div>
    </section>
  );
}

function TemplateSkeletonGrid({ content }: { content: TemplatesContent }) {
  return (
    <div
      aria-label={content.loading}
      className="flex w-max gap-4 pl-16 md:pl-24"
      role="status"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <article
          className="w-[min(78vw,17rem)] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-ydeck-panel/80 p-3 md:w-64"
          key={index}
        >
          <div className="aspect-[16/9] animate-pulse overflow-hidden rounded-xl border border-white/10 bg-white/[0.06]" />
          <div className="mt-3 h-3 w-28 animate-pulse rounded-full bg-white/15" />
          <div className="mt-4 h-5 w-48 animate-pulse rounded-full bg-white/20" />
          <div className="mt-2 h-5 w-36 animate-pulse rounded-full bg-white/15" />
          <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-white/12" />
          <div className="mt-2 h-4 w-4/5 animate-pulse rounded-full bg-white/10" />
        </article>
      ))}
    </div>
  );
}

function TemplateEmptyState({
  content,
  locale,
  onJoinWaitlist,
}: {
  content: TemplatesContent;
  locale: Locale;
  onJoinWaitlist?: (locale: Locale) => void;
}) {
  return (
    <div className="mx-auto flex min-h-[22rem] max-w-2xl flex-col items-start justify-center rounded-2xl border border-white/10 bg-ydeck-panel/70 p-6">
      <h3 className="text-2xl font-semibold tracking-[-0.03em]">
        {content.emptyTitle}
      </h3>
      <p className="mt-3 leading-7 text-ydeck-muted">{content.emptyBody}</p>
      <a
        className="mt-6 inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-ydeck-black transition hover:bg-slate-200"
        href={localizedPath('/waitlist', locale)}
        onClick={(event) => {
          if (!onJoinWaitlist) return;
          event.preventDefault();
          onJoinWaitlist(locale);
        }}
      >
        {content.emptyCta}
        <ArrowRight className="ml-2 h-4 w-4" />
      </a>
    </div>
  );
}

function TemplateCard({
  content,
  locale,
  onJoinWaitlist,
  template,
}: {
  content: TemplatesContent;
  locale: Locale;
  onJoinWaitlist?: (locale: Locale) => void;
  template: ReportTemplateSummary;
}) {
  const [imageBroken, setImageBroken] = useState(false);
  const primaryPreview = imageBroken ? null : template.thumbnail;
  const carouselSlides = template.previewImages.slice(0, 4);
  const carouselWidth = Math.max(0, carouselSlides.length * 3.875 - 13.25);
  const statusLabel =
    template.statusLabel || content.statusLabels[template.status];
  const ctaLabel = getCtaLabel(content, template.ctaType);
  const ctaHref = getCtaHref(template.ctaType, locale);

  return (
    <article className="group w-[min(78vw,17rem)] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-ydeck-panel/80 p-3 transition hover:-translate-y-1 hover:border-cyan-300/35 md:w-64">
      {primaryPreview ? (
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-white/10 bg-[#EFF3F8]">
          <img
            alt={primaryPreview.alt || content.thumbnailAltFallback}
            className="h-full w-full object-contain"
            height={primaryPreview.height}
            loading="lazy"
            onError={() => setImageBroken(true)}
            src={primaryPreview.url}
            width={primaryPreview.width}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,5,10,0)_45%,rgba(3,5,10,0.34)_100%)]" />
          {carouselSlides.length > 1 ? (
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
                  <PreviewStripImage
                    content={content}
                    key={`${preview.url}-${index}`}
                    preview={preview}
                  />
                ))}
              </div>
            </div>
          ) : null}
          <span className="absolute right-2 top-2 rounded-full border border-black/10 bg-white/90 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-700">
            {statusLabel}
          </span>
          {!template.availability.publiclyExecutable ? (
            <span className="absolute bottom-2 right-2 rounded-full bg-black/45 px-2 py-1 text-[9px] font-semibold text-white/90">
              {content.notExecutableLabel}
            </span>
          ) : null}
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
        {template.category || template.industry}
      </p>
      <h3 className="template-card-title mt-2 min-h-[3.25rem] text-lg font-semibold leading-tight tracking-[-0.03em]">
        {template.name}
      </h3>
      <p className="template-card-description mt-2 text-sm text-ydeck-muted">
        {template.shortDescription}
      </p>
      <p className="template-card-title mt-3 min-h-9 text-xs leading-5 text-slate-400">
        <span className="font-semibold text-slate-300">{content.inputPrefix}: </span>
        {template.inputSummary.slice(0, 3).join(', ')}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {template.outputFormats.map((output) => (
          <span
            className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-300"
            key={`${template.id}-${output.format}`}
          >
            {output.format.toUpperCase()} —{' '}
            {output.statusLabel || content.outputStatusLabels[output.status]}
          </span>
        ))}
      </div>
      {ctaLabel ? (
        <a
          className="mt-4 inline-flex items-center text-xs font-semibold text-white transition hover:text-ydeck-cyan"
          href={ctaHref}
          onClick={(event) => {
            if (!onJoinWaitlist || template.ctaType === 'contact_sales') return;
            event.preventDefault();
            onJoinWaitlist(locale);
          }}
        >
          {ctaLabel}
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </a>
      ) : null}
    </article>
  );
}

function PreviewStripImage({
  content,
  preview,
}: {
  content: TemplatesContent;
  preview: ReportTemplateImage;
}) {
  const [imageBroken, setImageBroken] = useState(false);

  if (imageBroken) return null;

  return (
    <span className="relative h-8 w-14 shrink-0 overflow-hidden rounded border border-white/35 bg-white shadow-[0_6px_12px_rgba(0,0,0,0.22)]">
      <img
        alt=""
        className="h-full w-full object-cover"
        height={preview.height}
        loading="lazy"
        onError={() => setImageBroken(true)}
        src={preview.url}
        width={preview.width}
      />
      <span className="sr-only">{preview.alt || content.thumbnailAltFallback}</span>
    </span>
  );
}

function getCtaLabel(content: TemplatesContent, ctaType: ReportTemplateCta) {
  if (ctaType === 'none') return null;
  return content.ctaLabels[ctaType] ?? null;
}

function getCtaHref(ctaType: ReportTemplateCta, locale: Locale) {
  if (ctaType === 'contact_sales') return contactHref;
  return localizedPath('/waitlist', locale);
}
