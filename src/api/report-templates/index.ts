import type { Locale } from "@/components/ydeck/types";

export type ReportTemplateStatus =
  | "concept"
  | "validation"
  | "design_partner_pilot"
  | "beta"
  | "available"
  | "deprecated";

export type ReportOutputStatus =
  | "planned"
  | "prototype"
  | "beta"
  | "available";

export type ReportOutputFormat = "pptx" | "pdf";

export type ReportTemplateCta =
  | "request_audit"
  | "apply_design_partner"
  | "contact_sales"
  | "none";

export type ReportTemplateLocale = "en-US" | "uz-Latn-UZ" | "ru-RU";

export type ReportTemplateImage = {
  url: string;
  alt: string;
  width: number;
  height: number;
  mimeType?: string;
};

export type ReportTemplateOutput = {
  format: ReportOutputFormat;
  status: ReportOutputStatus;
  statusLabel?: string;
};

export type ReportTemplate = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  industry: string;
  category: string;
  status: ReportTemplateStatus;
  statusLabel: string;
  featured: boolean;
  sortOrder: number;
  outputFormats: ReportTemplateOutput[];
  inputSummary: string[];
  reportSections: string[];
  thumbnail: ReportTemplateImage | null;
  previewImages: ReportTemplateImage[];
  supportedLocales: ReportTemplateLocale[];
  availability: {
    publiclyExecutable: boolean;
  };
  ctaType: ReportTemplateCta;
  updatedAt: string;
};

export type ReportTemplateSummary = ReportTemplate;

export type ReportTemplatesResponse = {
  items: ReportTemplate[];
  nextCursor?: string | null;
};

export type LandingReportTemplatesPayload = {
  locale: ReportTemplateLocale;
  items: ReportTemplateSummary[];
  source: "api" | "fallback";
};

export type GetReportTemplatesParams = {
  locale: ReportTemplateLocale;
  featured?: boolean;
  category?: string;
  industry?: string;
  status?: ReportTemplateStatus;
  outputFormat?: ReportOutputFormat;
  limit?: number;
  cursor?: string;
};

type ReportTemplatesFetchOptions = {
  signal?: AbortSignal;
  baseUrl?: string;
  cache?: RequestCache;
  next?: {
    revalidate?: number;
  };
};

const templateStatuses = new Set<ReportTemplateStatus>([
  "concept",
  "validation",
  "design_partner_pilot",
  "beta",
  "available",
  "deprecated",
]);

const outputStatuses = new Set<ReportOutputStatus>([
  "planned",
  "prototype",
  "beta",
  "available",
]);

const outputFormats = new Set<ReportOutputFormat>(["pptx", "pdf"]);
const reportTemplateLocales = new Set<ReportTemplateLocale>([
  "en-US",
  "ru-RU",
  "uz-Latn-UZ",
]);
const ctaTypes = new Set<ReportTemplateCta>([
  "request_audit",
  "apply_design_partner",
  "contact_sales",
  "none",
]);

export class ReportTemplatesApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ReportTemplatesApiError";
    this.status = status;
  }
}

export class ReportTemplatesValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReportTemplatesValidationError";
  }
}

export function toReportTemplateLocale(
  locale: Locale | "uz-Latn" | ReportTemplateLocale,
): ReportTemplateLocale {
  switch (locale) {
    case "en-US":
    case "ru-RU":
    case "uz-Latn-UZ":
      return locale;
    case "uz":
    case "uz-Latn":
      return "uz-Latn-UZ";
    case "ru":
      return "ru-RU";
    case "en":
    default:
      return "en-US";
  }
}

export function buildReportTemplatesPath(params: GetReportTemplatesParams) {
  const query = new URLSearchParams();
  query.set("locale", params.locale);

  if (params.featured !== undefined) {
    query.set("featured", String(params.featured));
  }
  if (params.category) {
    query.set("category", params.category);
  }
  if (params.industry) {
    query.set("industry", params.industry);
  }
  if (params.status) {
    query.set("status", params.status);
  }
  if (params.outputFormat) {
    query.set("outputFormat", params.outputFormat);
  }
  if (params.limit !== undefined) {
    query.set("limit", String(params.limit));
  }
  if (params.cursor) {
    query.set("cursor", params.cursor);
  }

  return `/api/v1/report-templates?${query.toString()}`;
}

export async function getReportTemplates(
  params: GetReportTemplatesParams,
  options: ReportTemplatesFetchOptions = {},
) {
  const response = await fetch(buildFetchUrl(buildReportTemplatesPath(params), options.baseUrl), {
    method: "GET",
    credentials: "omit",
    headers: {
      Accept: "application/json",
    },
    cache: options.cache,
    next: options.next,
    signal: options.signal,
  } satisfies RequestInit & { next?: ReportTemplatesFetchOptions["next"] });

  if (!response.ok) {
    throw new ReportTemplatesApiError("Report templates request failed.", response.status);
  }

  const body = await response.json() as unknown;
  return validateReportTemplatesResponse(body);
}

export async function getReportTemplateBySlug(
  slug: string,
  locale: ReportTemplateLocale,
  options: ReportTemplatesFetchOptions = {},
) {
  const query = new URLSearchParams({ locale });
  const response = await fetch(
    buildFetchUrl(
      `/api/v1/report-templates/${encodeURIComponent(slug)}?${query.toString()}`,
      options.baseUrl,
    ),
    {
      method: "GET",
      credentials: "omit",
      headers: {
        Accept: "application/json",
      },
      cache: options.cache,
      next: options.next,
      signal: options.signal,
    } satisfies RequestInit & { next?: ReportTemplatesFetchOptions["next"] },
  );

  if (!response.ok) {
    throw new ReportTemplatesApiError("Report template request failed.", response.status);
  }

  return validateReportTemplate(await response.json() as unknown);
}

function buildFetchUrl(path: string, baseUrl?: string) {
  if (!baseUrl) {
    return path;
  }

  const parsedBase = new URL(baseUrl);
  if (!["http:", "https:"].includes(parsedBase.protocol)) {
    throw new ReportTemplatesApiError("Report templates API origin must use HTTP or HTTPS.");
  }

  if (process.env.NODE_ENV === "production" && parsedBase.protocol !== "https:") {
    throw new ReportTemplatesApiError("Production report templates API origin must use HTTPS.");
  }

  return new URL(path, parsedBase.origin).toString();
}

export function validateReportTemplatesResponse(value: unknown): ReportTemplatesResponse {
  if (Array.isArray(value)) {
    return { items: value.map(validateReportTemplate) };
  }

  const record = asRecord(value, "Report templates response must be an object.");
  const rawItems = record.items;

  if (!Array.isArray(rawItems)) {
    throw new ReportTemplatesValidationError("Report templates response is missing items.");
  }

  const pagination = record.pagination;
  const paginationRecord =
    pagination === undefined || pagination === null
      ? null
      : asRecord(pagination, "Report templates pagination is invalid.");
  const nextCursor = record.nextCursor ?? paginationRecord?.nextCursor;
  if (
    nextCursor !== undefined &&
    nextCursor !== null &&
    typeof nextCursor !== "string"
  ) {
    throw new ReportTemplatesValidationError("Report templates next cursor is invalid.");
  }

  return {
    items: rawItems.map(validateReportTemplate),
    nextCursor: nextCursor ?? null,
  };
}

export function validateReportTemplate(value: unknown): ReportTemplate {
  const record = asRecord(value, "Report template must be an object.");
  const status = enumValue(record.status, templateStatuses, "Report template status is invalid.");
  const ctaType = enumValue(record.ctaType, ctaTypes, "Report template CTA type is invalid.");
  const thumbnail = safeImage(record.thumbnail);

  return {
    id: stringValue(record.id, "Report template id is invalid."),
    slug: stringValue(record.slug, "Report template slug is invalid."),
    name: stringValue(record.name, "Report template name is invalid."),
    shortDescription: stringValue(
      record.shortDescription,
      "Report template description is invalid.",
    ),
    industry: stringValue(record.industry, "Report template industry is invalid."),
    category: stringValue(record.category, "Report template category is invalid."),
    status,
    statusLabel: optionalString(record.statusLabel) ?? "",
    featured: booleanValue(record.featured, "Report template featured flag is invalid."),
    sortOrder: numberValue(record.sortOrder, "Report template sort order is invalid."),
    outputFormats: arrayValue(record.outputFormats, "Report template outputs are invalid.")
      .map(validateOutput),
    inputSummary: stringList(record.inputSummary, "Report template input summary is invalid."),
    reportSections: stringList(record.reportSections, "Report template sections are invalid."),
    thumbnail,
    previewImages: optionalArray(record.previewImages).flatMap((image) => {
      const validated = safeImage(image);
      return validated ? [validated] : [];
    }),
    supportedLocales: arrayValue(
      record.supportedLocales,
      "Report template supported locales are invalid.",
    ).map((locale) =>
      enumValue(
        locale,
        reportTemplateLocales,
        "Report template supported locale is invalid.",
      )
    ),
    availability: validateAvailability(record.availability),
    ctaType,
    updatedAt: stringValue(record.updatedAt, "Report template update date is invalid."),
  };
}

function validateOutput(value: unknown): ReportTemplateOutput {
  const record = asRecord(value, "Report template output must be an object.");
  return {
    format: enumValue(record.format, outputFormats, "Report template output format is invalid."),
    status: enumValue(record.status, outputStatuses, "Report template output status is invalid."),
    statusLabel: optionalString(record.statusLabel),
  };
}

function validateImage(value: unknown): ReportTemplateImage {
  const record = asRecord(value, "Report template image must be an object.");
  const url = stringValue(record.url, "Report template image URL is invalid.");

  if (!isTrustedImageUrl(url)) {
    throw new ReportTemplatesValidationError("Report template image URL is not trusted.");
  }

  return {
    url,
    alt: stringValue(record.alt, "Report template image alt text is invalid."),
    width: numberValue(record.width, "Report template image width is invalid."),
    height: numberValue(record.height, "Report template image height is invalid."),
    mimeType: optionalString(record.mimeType),
  };
}

function safeImage(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  try {
    return validateImage(value);
  } catch (error) {
    if (error instanceof ReportTemplatesValidationError) {
      return null;
    }
    throw error;
  }
}

function validateAvailability(value: unknown): ReportTemplate["availability"] {
  const record = asRecord(value, "Report template availability must be an object.");
  return {
    publiclyExecutable: booleanValue(
      record.publiclyExecutable,
      "Report template executable flag is invalid.",
    ),
  };
}

function isTrustedImageUrl(url: string) {
  if (url.startsWith("/")) {
    return !url.startsWith("//");
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && process.env.NODE_ENV === "production") {
      return false;
    }
    return (
      parsed.hostname === "api.ydeck.app" ||
      parsed.hostname.endsWith(".ydeck.app") ||
      (process.env.NODE_ENV !== "production" &&
        (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1"))
    );
  } catch {
    return false;
  }
}

function asRecord(value: unknown, message: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ReportTemplatesValidationError(message);
  }
  return value as Record<string, unknown>;
}

function stringValue(value: unknown, message: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ReportTemplatesValidationError(message);
  }
  return value;
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function booleanValue(value: unknown, message: string) {
  if (typeof value !== "boolean") {
    throw new ReportTemplatesValidationError(message);
  }
  return value;
}

function numberValue(value: unknown, message: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ReportTemplatesValidationError(message);
  }
  return value;
}

function arrayValue(value: unknown, message: string) {
  if (!Array.isArray(value)) {
    throw new ReportTemplatesValidationError(message);
  }
  return value;
}

function optionalArray(value: unknown) {
  if (value === undefined || value === null) {
    return [];
  }
  return arrayValue(value, "Report template image list is invalid.");
}

function stringList(value: unknown, message: string) {
  if (typeof value === "string" && value.trim().length > 0) {
    return [value];
  }
  return arrayValue(value, message).map((item) => stringValue(item, message));
}

function enumValue<T extends string>(
  value: unknown,
  allowed: Set<T>,
  message: string,
): T {
  if (typeof value !== "string" || !allowed.has(value as T)) {
    throw new ReportTemplatesValidationError(message);
  }
  return value as T;
}
