import assert from "node:assert/strict";
import { test } from "node:test";
import { requestAccountDeletion } from "@/src/api/account";
import { listPlans } from "@/src/api/billing";
import { listDesktopDevices, revokeAllDesktopDevices, revokeDesktopDevice } from "@/src/api/devices";
import { createWorkspace } from "@/src/api/workspace";

process.env.NEXT_PUBLIC_YDECK_API_BASE_URL = "https://api.ydeck.test";

test("account deletion uses the confirmed DELETE contract", async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  let method = "";
  let body = "";
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    requestedUrl = String(input);
    method = init?.method ?? "GET";
    body = String(init?.body ?? "");
    return new Response(JSON.stringify({ deletionScheduledFor: "2026-08-21T00:00:00.000Z" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const response = await requestAccountDeletion({
      confirmation: "DELETE",
      currentPassword: "configured-password",
    });
    assert.equal(requestedUrl, "/api/v1/account");
    assert.equal(method, "DELETE");
    assert.deepEqual(JSON.parse(body), {
      confirmation: "DELETE",
      currentPassword: "configured-password",
    });
    assert.equal(response.deletionScheduledFor, "2026-08-21T00:00:00.000Z");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("revoke-all desktop devices sends the expected payload", async () => {
  const originalFetch = globalThis.fetch;
  let body = "";
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    body = String(init?.body ?? "");
    return new Response(JSON.stringify({ revokedDevices: 2, revokedSessions: 3 }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const response = await revokeAllDesktopDevices({ reason: "rotate devices" });
    assert.equal(response.revokedDevices, 2);
    assert.equal(JSON.parse(body).preserveCurrentDevice, false);
    assert.equal(JSON.parse(body).reason, "rotate devices");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Desktop device decoding keeps only the documented account fields", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({
      devices: [{
        id: "760000000000000000000001",
        name: "Work Mac",
        platform: "macos",
        architecture: "arm64",
        status: "revoked",
        trustLevel: "blocked",
        revokeReason: "user_revoked",
        refreshTokenHash: "must-not-reach-state",
      }],
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    })) as typeof fetch;

  try {
    const devices = await listDesktopDevices();
    assert.equal(devices[0].revokeReason, "user_revoked");
    assert.equal("refreshTokenHash" in devices[0], false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("single Desktop device revocation is safe to repeat", async () => {
  const originalFetch = globalThis.fetch;
  const calls: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push(`${init?.method}:${String(input)}`);
    return new Response(null, { status: 204 });
  }) as typeof fetch;

  try {
    await revokeDesktopDevice("760000000000000000000001");
    await revokeDesktopDevice("760000000000000000000001");
    assert.deepEqual(calls, [
      "DELETE:/api/v1/account/devices/760000000000000000000001",
      "DELETE:/api/v1/account/devices/760000000000000000000001",
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("public billing plans fetch is unauthenticated", async () => {
  const originalFetch = globalThis.fetch;
  let authorizationHeader: string | null = null;
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    authorizationHeader = (init?.headers as Headers | undefined)?.get("Authorization") ?? null;
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const response = await listPlans();
    assert.deepEqual(response, []);
    assert.equal(authorizationHeader, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("workspace creation sends only the supported workspace fields", async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  let method = "";
  let body = "";
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    requestedUrl = String(input);
    method = init?.method ?? "GET";
    body = String(init?.body ?? "");
    return new Response(JSON.stringify({ id: "ws_123", name: "Design Team" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const workspace = await createWorkspace({ name: "Design Team" });
    assert.equal(requestedUrl, "/api/v1/workspaces");
    assert.equal(method, "POST");
    assert.deepEqual(JSON.parse(body), { name: "Design Team" });
    assert.equal(workspace.id, "ws_123");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
