import { getFallbackReportTemplates } from '@/components/ydeck/data/reportTemplateFallback';
import type { Locale } from '@/components/ydeck/types';
import {
  getReportTemplates,
  toReportTemplateLocale,
  type LandingReportTemplatesPayload,
} from '@/src/api/report-templates';

const LOCAL_API_ORIGIN = 'http://127.0.0.1:8085';
const PRODUCTION_API_ORIGIN = 'https://api.ydeck.app';
const REPORT_TEMPLATES_REVALIDATE_SECONDS = 300;

export function resolveReportTemplatesApiOrigin(
  env: NodeJS.ProcessEnv = process.env
) {
  const configured =
    env.YDECK_API_PROXY_TARGET ?? env.NEXT_PUBLIC_YDECK_API_BASE_URL;
  const target =
    configured ??
    (env.NODE_ENV === 'development' ? LOCAL_API_ORIGIN : PRODUCTION_API_ORIGIN);
  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    throw new Error('Report templates API origin must be a valid URL.');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Report templates API origin must use HTTP or HTTPS.');
  }

  if (env.NODE_ENV === 'production' && parsed.protocol !== 'https:') {
    throw new Error('Production report templates API origin must use HTTPS.');
  }

  return parsed.origin;
}

export async function getLandingReportTemplates(
  locale: Locale
): Promise<LandingReportTemplatesPayload> {
  const apiLocale = toReportTemplateLocale(locale);

  try {
    const response = await getReportTemplates(
      {
        locale: apiLocale,
        featured: true,
        limit: 6,
      },
      {
        baseUrl: resolveReportTemplatesApiOrigin(),
        cache: 'force-cache',
        next: { revalidate: REPORT_TEMPLATES_REVALIDATE_SECONDS },
        signal: AbortSignal.timeout(3500),
      }
    );

    return {
      locale: apiLocale,
      items: response.items,
      source: 'api',
    };
  } catch (error) {
    console.warn(
      '[landing] Report templates catalog unavailable; rendering fallback catalog.',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return {
      locale: apiLocale,
      items: getFallbackReportTemplates(locale),
      source: 'fallback',
    };
  }
}
