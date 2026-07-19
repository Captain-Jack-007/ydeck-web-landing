import type { ApiErrorBody } from "@/src/api/types";

type RequestBody = Record<string, unknown> | unknown[] | string | number | boolean | null;

export class YDeckApiError extends Error {
  code: string;
  status: number;
  details?: unknown;
  requestId?: string | null;
  retryAfter?: number | null;
  retryable?: boolean;

  constructor(args: {
    code: string;
    message: string;
    status: number;
    details?: unknown;
    requestId?: string | null;
    retryAfter?: number | null;
    retryable?: boolean;
  }) {
    super(args.message);
    this.name = "YDeckApiError";
    this.code = args.code;
    this.status = args.status;
    this.details = args.details;
    this.requestId = args.requestId;
    this.retryAfter = args.retryAfter;
    this.retryable = args.retryable;
  }
}

let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;
let unauthorizedHandler: (() => void) | null = null;
let accessTokenRefreshedHandler: (() => void) | null = null;
const defaultApiBaseUrl = "https://api.ydeck.app";

export function setApiAccessToken(token: string | null) {
  accessToken = token;
}

export function getApiAccessToken() {
  return accessToken;
}

export function clearApiAccessToken() {
  accessToken = null;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export function setAccessTokenRefreshedHandler(handler: (() => void) | null) {
  accessTokenRefreshedHandler = handler;
}

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_YDECK_API_BASE_URL?.replace(/\/$/, "") ?? defaultApiBaseUrl;
}

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath;
}

function readCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }
  return (
    document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${name}=`))
      ?.split("=")[1] ?? null
  );
}

export function hasWebRefreshSessionHint() {
  return Boolean(readCookie("ydeck_csrf"));
}

function parseRetryAfter(value: string | null) {
  if (!value) {
    return null;
  }
  const seconds = Number(value);
  return Number.isFinite(seconds) ? seconds : null;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (!value || typeof value !== "object") {
    return false;
  }
  const maybe = value as { error?: unknown };
  if (!maybe.error || typeof maybe.error !== "object") {
    return false;
  }
  const error = maybe.error as { code?: unknown; message?: unknown };
  const metadata = maybe.error as { requestId?: unknown; retryable?: unknown };
  return (
    typeof error.code === "string" &&
    typeof error.message === "string" &&
    (metadata.requestId === undefined || typeof metadata.requestId === "string") &&
    (metadata.retryable === undefined || typeof metadata.retryable === "boolean")
  );
}

export function normalizeApiError(response: Response, body: unknown) {
  const requestId =
    response.headers.get("x-request-id") ??
    response.headers.get("x-ydeck-request-id") ??
    null;
  const retryAfter = parseRetryAfter(response.headers.get("retry-after"));

  if (isApiErrorBody(body)) {
    return new YDeckApiError({
      code: body.error.code,
      message: body.error.message || "Something went wrong. Please try again.",
      details: body.error.details,
      status: response.status,
      requestId: body.error.requestId ?? requestId,
      retryAfter,
      retryable: body.error.retryable,
    });
  }

  return new YDeckApiError({
    code: response.status === 401 ? "AUTH_REQUIRED" : `HTTP_${response.status}`,
    message: response.status >= 500 ? "Something went wrong. Please try again." : "The request failed.",
    status: response.status,
    requestId,
    retryAfter,
  });
}

function shouldAttemptRefresh(error: YDeckApiError) {
  return (
    error.status === 401 ||
    error.code === "AUTH_REQUIRED" ||
    error.code === "AUTH_SESSION_EXPIRED"
  );
}

async function fetchJson<T>(
  path: string,
  init: RequestInit & { body?: BodyInit | null },
): Promise<T> {
  const response = await fetch(buildUrl(path), init);
  const body = await parseResponseBody(response);

  if (!response.ok) {
    throw normalizeApiError(response, body);
  }

  return body as T;
}

export async function refreshWebAccessToken(
  options: { throwOnFailure?: boolean; notify?: boolean } = {},
): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const csrf = readCookie("ydeck_csrf");
      const result = await fetchJson<{ accessToken: string }>("/api/v1/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrf ? { "X-CSRF-Token": decodeURIComponent(csrf) } : {}),
        },
        body: JSON.stringify({}),
      });
      setApiAccessToken(result.accessToken);
      if (options.notify !== false) {
        accessTokenRefreshedHandler?.();
      }
      return result.accessToken;
    })();
  }

  try {
    return await refreshPromise;
  } catch (error) {
    if (error instanceof YDeckApiError && shouldAttemptRefresh(error)) {
      clearApiAccessToken();
    }
    if (options.throwOnFailure) {
      throw error;
    }
    return null;
  } finally {
    refreshPromise = null;
  }
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: RequestBody;
    signal?: AbortSignal;
    auth?: boolean;
    retryOnAuth?: boolean;
    headers?: HeadersInit;
  } = {},
): Promise<T> {
  const method = options.method ?? "GET";
  const token = getApiAccessToken();
  const includedAccessToken = options.auth !== false && Boolean(token);
  const csrf = readCookie("ydeck_csrf");
  const hasJsonBody = options.body !== undefined;
  const headers = new Headers(options.headers);

  if (hasJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (includedAccessToken && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (csrf && (method !== "GET" || path.includes("/auth/refresh"))) {
    headers.set("X-CSRF-Token", decodeURIComponent(csrf));
  }

  const init: RequestInit & { body?: BodyInit | null } = {
    method,
    credentials: "include",
    headers,
    signal: options.signal,
    body: hasJsonBody ? JSON.stringify(options.body) : undefined,
  };

  try {
    return await fetchJson<T>(path, init);
  } catch (error) {
    if (
      error instanceof YDeckApiError &&
      options.auth !== false &&
      options.retryOnAuth !== false &&
      includedAccessToken &&
      shouldAttemptRefresh(error)
    ) {
      const nextToken = await refreshWebAccessToken();
      if (nextToken) {
        headers.set("Authorization", `Bearer ${nextToken}`);
        return fetchJson<T>(path, { ...init, headers });
      }
      unauthorizedHandler?.();
    }
    throw error;
  }
}

export function getHumanErrorMessage(error: unknown) {
  if (error instanceof YDeckApiError) {
    const support = error.requestId ? ` Request ID: ${error.requestId}.` : "";
    switch (error.code) {
      case "AUTH_INVALID_CREDENTIALS":
        return "The email or password is not correct.";
      case "AUTH_EMAIL_NOT_VERIFIED":
        return "Please verify your email before continuing.";
      case "AUTH_REGISTRATION_UNAVAILABLE":
        return "We could not create a new account with these details. Try signing in or recovering access instead.";
      case "AUTH_MAIL_DELIVERY_UNAVAILABLE":
      case "AUTH_EMAIL_PROVIDER_UNAVAILABLE":
      case "AUTH_EMAIL_PROVIDER_RATE_LIMITED":
      case "AUTH_EMAIL_CONFIGURATION_ERROR":
      case "AUTH_EMAIL_DELIVERY_FAILED":
        return process.env.NODE_ENV !== "production"
          ? `Authentication email delivery is unavailable. In local development, set AUTH_MAIL_PROVIDER=console, AUTH_STATIC_VERIFICATION_CODE_ENABLED=true, and AUTH_STATIC_VERIFICATION_CODE to a development code in the backend .env, then restart the backend.${support}`
          : `Authentication email delivery is temporarily unavailable. Please try again later.${support}`;
      case "AUTH_CSRF_INVALID":
        return process.env.NODE_ENV !== "production"
          ? `The local browser session could not be restored. Add http://localhost:3005 to AUTH_ALLOWED_WEB_ORIGINS in the backend .env, then restart the backend.${support}`
          : `Your session could not be restored. Please sign in again.${support}`;
      case "AUTH_RATE_LIMITED":
      case "ACCOUNT_RATE_LIMITED":
      case "RATE_LIMITED":
        return "Too many attempts. Wait a moment, then try again.";
      case "AUTH_CODE_INVALID":
        return "That code is not valid. Check the email and try again.";
      case "AUTH_CODE_EXPIRED":
        return "That code has expired. Request a new code to continue.";
      case "AUTH_CODE_ATTEMPTS_EXCEEDED":
        return "Too many code attempts. Request a new code when allowed.";
      case "RECENT_AUTH_REQUIRED":
        return "Please sign in again before making this security change.";
      case "CURRENT_PASSWORD_INVALID":
        return "The current password is not correct.";
      case "PROFILE_VALIDATION_FAILED":
        return "Check the profile fields and try again.";
      case "INVALID_TIME_ZONE":
        return "Choose a valid time zone and try again.";
      case "SOLE_WORKSPACE_OWNER":
        return "Transfer ownership of your organization workspace before deleting this account.";
      case "ACTIVE_SUBSCRIPTION_BLOCKS_DELETION":
        return "Cancel the active workspace subscription before deleting this account.";
      case "ACCOUNT_DELETION_ALREADY_PENDING":
        return "Account deletion is already scheduled.";
      case "ACCOUNT_DELETION_NOT_PENDING":
        return "There is no pending account deletion to cancel.";
      case "BILLING_PERMISSION_DENIED":
        return "You can view billing, but only workspace owners or admins can change it.";
      case "PAIRING_EXPIRED":
        return "This pairing code expired. Start pairing again from YDeck Desktop.";
      case "PAIRING_ALREADY_USED":
        return "This pairing request has already been used or decided.";
      case "PAIRING_NOT_FOUND":
        return "We could not find that pairing request. Check the code and try again.";
      case "PAIRING_DENIED":
        return "This pairing request was denied. Start again from YDeck Desktop if you want to connect.";
      case "PAIRING_RATE_LIMITED":
        return "Too many pairing attempts. Wait before trying again.";
      case "BILLING_PROVIDER_ERROR":
      case "CHECKOUT_CREATION_FAILED":
      case "SUBSCRIPTION_CHANGE_NOT_ALLOWED":
      case "SUBSCRIPTION_REACTIVATION_NOT_ALLOWED":
      case "SUBSCRIPTION_STATE_CONFLICT":
        return `Unable to update billing right now. Please try again.${support}`;
      case "INTERNAL":
      case "INTERNAL_ERROR":
      case "HTTP_500":
      case "HTTP_502":
      case "HTTP_503":
      case "HTTP_504":
        return `Something went wrong. Please try again.${support}`;
      default:
        return `Something went wrong. Please try again.${support}`;
    }
  }
  return "Something went wrong. Please try again.";
}
