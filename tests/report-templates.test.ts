import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { afterEach, test } from "node:test";
import { getFallbackReportTemplates } from "@/components/ydeck/data/reportTemplateFallback";
import {
  buildReportTemplatesPath,
  getReportTemplates,
  ReportTemplatesValidationError,
  toReportTemplateLocale,
  validateReportTemplatesResponse,
  type ReportTemplateSummary,
} from "@/src/api/report-templates";
import { resolveReportTemplatesApiOrigin } from "@/src/api/report-templates/server";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function sampleTemplate(overrides: Partial<ReportTemplateSummary> = {}): ReportTemplateSummary {
  return {
    id: "tpl_1",
    slug: "mining_monthly_operations",
    name: "Monthly Operations Review",
    shortDescription: "Recurring mining operations report.",
    industry: "Mining",
    category: "Operations review",
    status: "validation",
    statusLabel: "In validation",
    featured: true,
    sortOrder: 10,
    outputFormats: [
      { format: "pptx", status: "beta", statusLabel: "beta" },
      { format: "pdf", status: "planned", statusLabel: "planned" },
    ],
    inputSummary: ["Production export", "Downtime log"],
    reportSections: ["Production", "Downtime"],
    thumbnail: {
      url: "/api/v1/report-templates/assets/mining-monthly-operations.svg?v=7",
      alt: "Monthly operations report preview",
      width: 1200,
      height: 675,
      mimeType: "image/svg+xml",
    },
    previewImages: [],
    supportedLocales: ["en-US"],
    availability: { publiclyExecutable: false },
    ctaType: "request_audit",
    updatedAt: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

test("report template locale mapping uses canonical API locales", () => {
  assert.equal(toReportTemplateLocale("en"), "en-US");
  assert.equal(toReportTemplateLocale("ru"), "ru-RU");
  assert.equal(toReportTemplateLocale("uz"), "uz-Latn-UZ");
  assert.equal(toReportTemplateLocale("uz-Latn"), "uz-Latn-UZ");
});

test("report template list path sends only requested query parameters", () => {
  const path = buildReportTemplatesPath({
    locale: "uz-Latn-UZ",
    featured: true,
    limit: 6,
  });

  assert.equal(
    path,
    "/api/v1/report-templates?locale=uz-Latn-UZ&featured=true&limit=6",
  );
  assert.doesNotMatch(path, /category|industry|cursor|outputFormat|status/);
});

test("report template response validation preserves thumbnail version strings", () => {
  const response = validateReportTemplatesResponse({
    items: [sampleTemplate()],
    pagination: { nextCursor: "next" },
  });

  assert.equal(response.items.length, 1);
  assert.equal(response.nextCursor, "next");
  assert.equal(
    response.items[0].thumbnail?.url,
    "/api/v1/report-templates/assets/mining-monthly-operations.svg?v=7",
  );
  assert.equal(response.items[0].outputFormats[0].format, "pptx");
  assert.equal(response.items[0].outputFormats[1].status, "planned");
});

test("report template validation rejects malformed catalog responses", () => {
  assert.throws(
    () =>
      validateReportTemplatesResponse({
        items: [{ ...sampleTemplate(), ctaType: "run_now" }],
      }),
    ReportTemplatesValidationError,
  );

  assert.throws(
    () => validateReportTemplatesResponse({ results: [sampleTemplate()] }),
    ReportTemplatesValidationError,
  );
});

test("report template validation rejects non-canonical supported locales", () => {
  assert.throws(
    () =>
      validateReportTemplatesResponse({
        items: [
          sampleTemplate({
            supportedLocales: ["en" as never],
          }),
        ],
      }),
    /supported locale/u,
  );
});

test("untrusted remote thumbnail hosts are not rendered", () => {
  const response = validateReportTemplatesResponse({
    items: [
      sampleTemplate({
        thumbnail: {
          url: "https://example.invalid/template.svg?v=1",
          alt: "External preview",
          width: 1200,
          height: 675,
        },
      }),
    ],
  });

  assert.equal(response.items[0].thumbnail, null);
});

test("public report template client fetches through the same-origin API path", async () => {
  const calls: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    calls.push(String(input));
    return new Response(JSON.stringify({ items: [sampleTemplate()] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;

  const response = await getReportTemplates({
    locale: "ru-RU",
    featured: true,
    limit: 6,
  });

  assert.equal(response.items[0].slug, "mining_monthly_operations");
  assert.equal(
    calls[0],
    "/api/v1/report-templates?locale=ru-RU&featured=true&limit=6",
  );
});

test("server report-template origin resolver normalizes and enforces production HTTPS", () => {
  assert.equal(
    resolveReportTemplatesApiOrigin({
      NODE_ENV: "development",
      YDECK_API_PROXY_TARGET: "http://localhost:3030/",
    }),
    "http://localhost:3030",
  );

  assert.throws(
    () =>
      resolveReportTemplatesApiOrigin({
        NODE_ENV: "production",
        YDECK_API_PROXY_TARGET: "http://api.ydeck.app",
      }),
    /must use HTTPS/u,
  );

  assert.throws(
    () =>
      resolveReportTemplatesApiOrigin({
        NODE_ENV: "development",
        YDECK_API_PROXY_TARGET: "not a url",
      }),
    /valid URL/u,
  );
});

test("fallback report templates are localized and non-executable", () => {
  const russian = getFallbackReportTemplates("ru");
  const uzbek = getFallbackReportTemplates("uz");

  assert.equal(russian.length, 6);
  assert.equal(uzbek.length, 6);
  assert.equal(
    russian.every((item) => item.availability.publiclyExecutable === false),
    true,
  );
  assert.equal(
    uzbek.every((item) => item.thumbnail?.url.includes("?v=1")),
    true,
  );
  assert.doesNotMatch(
    russian.map((item) => `${item.name} ${item.shortDescription}`).join("\n"),
    /Monthly Operations|Inputs|Request audit|Run this report/,
  );
});

test("landing carousel no longer uses old presentation-template preview data", async () => {
  const section = await readFile(
    new URL("../components/ydeck/sections/TemplatesSection.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(section, /templatePreviews|makeTemplateSlides|formatSlideCount/);
  assert.doesNotMatch(section, /Run this report|Generate now|Use template|Start report/i);
  assert.match(section, /getReportTemplates/);
  assert.match(section, /publiclyExecutable/);
  assert.match(section, /mailto:hello@ydeck.ai/);
});
