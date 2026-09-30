import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  apiRequest,
  clearApiAccessToken,
  getApiAccessToken,
  getApiBaseUrl,
  getHumanErrorMessage,
  hasWebRefreshSessionHint,
  normalizeApiError,
  refreshWebAccessToken,
  setAccessTokenRefreshedHandler,
  setApiAccessToken,
  setUnauthorizedHandler,
} from "@/src/api/client";

const originalApiBaseUrl = process.env.NEXT_PUBLIC_YDECK_API_BASE_URL;

afterEach(() => {
  clearApiAccessToken();
  setAccessTokenRefreshedHandler(null);
  setUnauthorizedHandler(null);
  if (originalApiBaseUrl === undefined) {
    delete process.env.NEXT_PUBLIC_YDECK_API_BASE_URL;
  } else {
    process.env.NEXT_PUBLIC_YDECK_API_BASE_URL = originalApiBaseUrl;
  }
});

test("successful access-token refresh notifies authenticated state providers", async () => {
  const originalFetch = globalThis.fetch;
  let refreshNotifications = 0;
  setAccessTokenRefreshedHandler(() => {
    refreshNotifications += 1;
  });
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ accessToken: "rotated-access-token" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    })) as typeof fetch;

  try {
    assert.equal(await refreshWebAccessToken(), "rotated-access-token");
    assert.equal(refreshNotifications, 1);
    assert.equal(getApiAccessToken(), "rotated-access-token");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("apiRequest retries after refresh on 401", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  setApiAccessToken("expired-token");
  process.env.NEXT_PUBLIC_YDECK_API_BASE_URL = "https://api.ydeck.test";

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });
    if (url.endsWith("/api/v1/protected") && calls.length === 1) {
      return new Response(JSON.stringify({ error: { code: "AUTH_REQUIRED", message: "reauth" } }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }
    if (url.endsWith("/api/v1/auth/refresh")) {
      return new Response(JSON.stringify({ accessToken: "fresh-token" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const result = await apiRequest<{ ok: boolean }>("/api/v1/protected");
    assert.equal(result.ok, true);
    assert.equal(calls.filter((call) => call.url.endsWith("/api/v1/auth/refresh")).length, 1);
    assert.equal(calls.filter((call) => call.url.endsWith("/api/v1/protected")).length, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("apiRequest does not refresh after a 401 when no access token was attached", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  process.env.NEXT_PUBLIC_YDECK_API_BASE_URL = "https://api.ydeck.test";

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });
    return new Response(JSON.stringify({ error: { code: "AUTH_REQUIRED", message: "reauth" } }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;

  try {
    await assert.rejects(
      apiRequest<{ ok: boolean }>("/api/v1/protected"),
      (error: unknown) => error instanceof Error && error.message === "reauth",
    );
    assert.equal(calls.filter((call) => call.url.endsWith("/api/v1/auth/refresh")).length, 0);
    assert.equal(calls.filter((call) => call.url.endsWith("/api/v1/protected")).length, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("session bootstrap has no refresh hint outside a browser cookie session", () => {
  assert.equal(hasWebRefreshSessionHint(), false);
});

test("strict session restoration exposes a CSRF configuration failure", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => new Response(JSON.stringify({
    error: {
      code: "AUTH_CSRF_INVALID",
      message: "The request could not be verified",
      requestId: "req_csrf",
    },
  }), {
    status: 403,
    headers: { "content-type": "application/json" },
  })) as typeof fetch;

  try {
    await assert.rejects(
      refreshWebAccessToken({ throwOnFailure: true }),
      (error: unknown) => error instanceof Error && error.message === "The request could not be verified",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("apiRequest uses the same-origin proxy path by default", async () => {
  delete process.env.NEXT_PUBLIC_YDECK_API_BASE_URL;
  const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    requestedUrl = String(input);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const response = await apiRequest<{ ok: boolean }>("/api/v1/auth/email/register", {
      method: "POST",
      auth: false,
      body: {},
    });
    assert.equal(response.ok, true);
    assert.equal(getApiBaseUrl(), "https://api.ydeck.app");
    assert.equal(requestedUrl.startsWith("/api/v1/"), true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("normalizeApiError keeps backend code and request id", () => {
  const response = new Response(JSON.stringify({ error: { code: "AUTH_RATE_LIMITED", message: "slow down" } }), {
    status: 429,
    headers: { "content-type": "application/json", "x-request-id": "req_123" },
  });
  const error = normalizeApiError(response, {
    error: { code: "AUTH_RATE_LIMITED", message: "slow down" },
  });
  assert.equal(error.code, "AUTH_RATE_LIMITED");
  assert.equal(error.requestId, "req_123");
});

test("credential failures use privacy-safe sign-in guidance", () => {
  const error = normalizeApiError(
    new Response(null, { status: 401 }),
    {
      error: {
        code: "AUTH_INVALID_CREDENTIALS",
        message: "Authentication failed",
      },
    },
  );

  assert.equal(getHumanErrorMessage(error), "The email or password is not correct.");
});

test("Desktop daemon responses explain the local proxy collision", () => {
  const error = normalizeApiError(
    new Response(null, { status: 401 }),
    {
      error: {
        code: "DESKTOP_AUTHENTICATION_REQUIRED",
        message: "Desktop Cloud authentication is required",
      },
    },
  );

  const message = getHumanErrorMessage(error);
  assert.match(message, /Desktop daemon/u);
  assert.match(message, /YDECK_API_PROXY_TARGET=http:\/\/localhost:2026/u);
  assert.equal(message.includes("Desktop Cloud authentication is required"), false);
});

test("getHumanErrorMessage explains local auth email delivery failures", () => {
  const error = normalizeApiError(
    new Response(null, { status: 503, headers: { "x-request-id": "req_mail" } }),
    {
      error: {
        code: "AUTH_MAIL_DELIVERY_UNAVAILABLE",
        message: "Authentication email delivery is unavailable",
      },
    },
  );
  const message = getHumanErrorMessage(error);
  assert.match(message, /local development/u);
  assert.match(message, /req_mail/u);
});

test("getHumanErrorMessage explains local CSRF origin failures", () => {
  const error = normalizeApiError(
    new Response(null, { status: 403, headers: { "x-request-id": "req_csrf" } }),
    {
      error: {
        code: "AUTH_CSRF_INVALID",
        message: "The request could not be verified",
      },
    },
  );
  const message = getHumanErrorMessage(error);
  assert.match(message, /AUTH_ALLOWED_WEB_ORIGINS/u);
  assert.match(message, /http:\/\/localhost:3005/u);
  assert.match(message, /req_csrf/u);
});

test("normalizeApiError reads Desktop request metadata from the error body", () => {
  const response = new Response(null, {
    status: 503,
    headers: { "content-type": "application/json" },
  });
  const error = normalizeApiError(response, {
    error: {
      code: "INTERNAL_ERROR",
      message: "internal detail",
      requestId: "req_desktop_123",
      retryable: true,
    },
  });
  assert.equal(error.requestId, "req_desktop_123");
  assert.equal(error.retryable, true);
});

test("refreshWebAccessToken does not invalidate auth on transient server errors", async () => {
  const originalFetch = globalThis.fetch;
  let unauthorizedCalled = false;
  setApiAccessToken("still-usable-token");
  process.env.NEXT_PUBLIC_YDECK_API_BASE_URL = "https://api.ydeck.test";
  setUnauthorizedHandler(() => {
    unauthorizedCalled = true;
  });

  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ error: { code: "INTERNAL_ERROR", message: "database unavailable" } }), {
      status: 500,
      headers: { "content-type": "application/json" },
    })) as typeof fetch;

  try {
    const token = await refreshWebAccessToken();
    assert.equal(token, null);
    assert.equal(unauthorizedCalled, false);
    assert.equal(getApiAccessToken(), "still-usable-token");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
