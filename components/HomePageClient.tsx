"use client";

import { YDeckPage } from "@/components/ydeck";
import type { Locale } from "@/lib/i18n";
import type { LandingReportTemplatesPayload } from "@/src/api/report-templates";

type HomePageClientProps = {
  initialLocale: Locale;
  initialReportTemplates: LandingReportTemplatesPayload;
};

export function HomePageClient({
  initialLocale,
  initialReportTemplates,
}: HomePageClientProps) {
  return (
    <YDeckPage
      initialLocale={initialLocale}
      initialReportTemplates={initialReportTemplates}
    />
  );
}
