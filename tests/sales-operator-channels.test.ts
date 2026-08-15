import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { afterEach, test } from "node:test";
import { clearApiAccessToken, YDeckApiError } from "@/src/api/client";
import * as salesOperatorApi from "@/src/api/sales-operator";
import {
  buildInstagramReturnUrl,
  parseInstagramCallback,
  safeProviderImageUrl,
  safeSalesOperatorError,
  sanitizeInstagramAssets,
  validateCloudAuthorizationUrl,
} from "@/src/lib/sales-operator-channels";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  clearApiAccessToken();
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

test("channels load from the active workspace endpoint", async () => {
  let requestedUrl = "";
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    requestedUrl = String(input);
    return jsonResponse({ connections: [] });
  }) as typeof fetch;

  await salesOperatorApi.listChannelConnections("workspace-a");
  assert.equal(requestedUrl, "/api/v1/workspaces/workspace-a/sales-operator/channels");
});

test("Instagram begin sends the exact provider and approved HTTPS return route once", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    return jsonResponse({
      authorizationSessionId: "authorization-session",
      authorizationUrl: "https://www.facebook.com/dialog/oauth?cloud=owned",
      expiresAt: "2026-08-15T12:00:00.000Z",
    }, 201);
  }) as typeof fetch;

  const redirectTarget = buildInstagramReturnUrl("https://ydeck.app", "workspace-a");
  const result = await salesOperatorApi.beginInstagramAuthorization("workspace-a", redirectTarget);
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.url, "/api/v1/workspaces/workspace-a/sales-operator/channels/meta/begin");
  assert.deepEqual(JSON.parse(String(calls[0]?.init?.body)), {
    provider: "instagram",
    redirectTarget: "https://ydeck.app/sales-operator/channels/instagram/return?flowWorkspaceId=workspace-a",
  });
  assert.equal(validateCloudAuthorizationUrl(result.authorizationUrl), result.authorizationUrl);
});

test("Instagram return routes require HTTPS and Cloud authorization URLs are never constructed locally", () => {
  assert.throws(() => buildInstagramReturnUrl("http://localhost:3005", "workspace-a"), /HTTPS/);
  assert.throws(() => validateCloudAuthorizationUrl("javascript:alert(1)"), /invalid authorization URL/i);
  assert.equal(validateCloudAuthorizationUrl("https://www.facebook.com/dialog/oauth?state=cloud"), "https://www.facebook.com/dialog/oauth?state=cloud");
});

test("callback parsing accepts only asset_selection_required with bounded temporary state", () => {
  assert.deepEqual(parseInstagramCallback({
    metaStatus: "asset_selection_required",
    authorizationSessionId: "session-id",
    flowWorkspaceId: "workspace-a",
  }), {
    ok: true,
    authorizationSessionId: "session-id",
    flowWorkspaceId: "workspace-a",
  });
  assert.deepEqual(parseInstagramCallback({
    metaStatus: "connected",
    authorizationSessionId: "session-id",
    flowWorkspaceId: "workspace-a",
  }), { ok: false, reason: "invalid_status" });
  assert.deepEqual(parseInstagramCallback({
    metaStatus: "asset_selection_required",
    authorizationSessionId: "x".repeat(81),
    flowWorkspaceId: "workspace-a",
  }), { ok: false, reason: "invalid_session" });
});

test("eligible assets use the active workspace, provider, and authorization session", async () => {
  let requestedUrl = "";
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    requestedUrl = String(input);
    return jsonResponse({ assets: [] });
  }) as typeof fetch;

  await salesOperatorApi.listInstagramAssets("workspace-a", "authorization-session");
  assert.equal(
    requestedUrl,
    "/api/v1/workspaces/workspace-a/sales-operator/channels/meta/assets?provider=instagram&authorizationSessionId=authorization-session",
  );
});

test("asset sanitization retains only safe fields and HTTPS images", () => {
  const [asset] = sanitizeInstagramAssets([{
    provider: "instagram",
    externalAccountId: "ig-safe-id",
    name: "YDeck Shop",
    username: "ydeck.shop",
    imageUrl: "javascript:alert(1)",
    linkedBusinessName: "YDeck Business",
    capabilities: ["receive_messages", "send_text"],
    tokenExpiresAt: null,
    credentialId: "must-not-survive",
    authorizationGrantId: "must-not-survive",
    accessToken: "must-not-survive",
  } as never]);

  assert.deepEqual(asset, {
    provider: "instagram",
    externalAccountId: "ig-safe-id",
    name: "YDeck Shop",
    username: "ydeck.shop",
    imageUrl: null,
    linkedBusinessName: "YDeck Business",
    capabilities: ["receive_messages", "send_text"],
    tokenExpiresAt: null,
  });
  assert.equal(safeProviderImageUrl("https://cdn.example.com/profile.jpg"), "https://cdn.example.com/profile.jpg");
  assert.equal(safeProviderImageUrl("http://cdn.example.com/profile.jpg"), null);
});

test("confirm sends only selected external account IDs and never automation settings", async () => {
  let requestBody: Record<string, unknown> | null = null;
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    requestBody = JSON.parse(String(init?.body));
    return jsonResponse({ connections: [] }, 201);
  }) as typeof fetch;

  await salesOperatorApi.confirmInstagramAssets("workspace-a", "authorization-session", ["ig-1", "ig-2"]);
  assert.deepEqual(requestBody, {
    authorizationSessionId: "authorization-session",
    provider: "instagram",
    externalAccountIds: ["ig-1", "ig-2"],
  });
  assert.equal(Object.hasOwn(requestBody ?? {}, "automatedRepliesEnabled"), false);
});

test("channel management helpers use the exact workspace-scoped endpoints", async () => {
  const calls: Array<{ url: string; method: string; body: unknown }> = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), method: init?.method ?? "GET", body: init?.body ? JSON.parse(String(init.body)) : null });
    if (init?.method === "DELETE") return new Response(null, { status: 204 });
    return jsonResponse({ id: "connection-a" });
  }) as typeof fetch;

  await salesOperatorApi.testChannelConnection("workspace-a", "connection-a");
  await salesOperatorApi.refreshChannelAuthorization("workspace-a", "connection-a");
  await salesOperatorApi.pauseChannel("workspace-a", "connection-a");
  await salesOperatorApi.resumeChannel("workspace-a", "connection-a");
  await salesOperatorApi.updateChannelSettings("workspace-a", "connection-a", true);
  await salesOperatorApi.disconnectChannel("workspace-a", "connection-a");

  assert.deepEqual(calls.map((call) => [call.method, call.url]), [
    ["POST", "/api/v1/workspaces/workspace-a/sales-operator/channels/connection-a/test"],
    ["POST", "/api/v1/workspaces/workspace-a/sales-operator/channels/connection-a/refresh"],
    ["POST", "/api/v1/workspaces/workspace-a/sales-operator/channels/connection-a/pause"],
    ["POST", "/api/v1/workspaces/workspace-a/sales-operator/channels/connection-a/resume"],
    ["PATCH", "/api/v1/workspaces/workspace-a/sales-operator/channels/connection-a/settings"],
    ["DELETE", "/api/v1/workspaces/workspace-a/sales-operator/channels/connection-a"],
  ]);
  assert.deepEqual(calls[4]?.body, { automatedRepliesEnabled: true });
  assert.equal(calls[0]?.body, null);
});

test("successful connection changes reload overview, runtime, and configuration", async () => {
  const requested: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    requested.push(String(input));
    return jsonResponse({});
  }) as typeof fetch;
  await salesOperatorApi.reloadSalesOperatorDependents("workspace-a");
  assert.deepEqual(requested.sort(), [
    "/api/v1/workspaces/workspace-a/sales-operator/configuration",
    "/api/v1/workspaces/workspace-a/sales-operator/overview",
    "/api/v1/workspaces/workspace-a/sales-operator/runtime",
  ]);
});

test("safe Sales Operator errors redact raw provider details and retain support IDs", () => {
  const safe = safeSalesOperatorError(new YDeckApiError({
    code: "META_PERMISSION_MISSING",
    message: "raw Meta response with token=secret",
    status: 403,
    requestId: "req-safe-123",
  }));
  assert.equal(safe.message, "Required Meta messaging permissions were not approved.");
  assert.equal(safe.message.includes("token=secret"), false);
  assert.equal(safe.requestId, "req-safe-123");

  const unknown = safeSalesOperatorError(new YDeckApiError({
    code: "UNKNOWN_META_FAILURE",
    message: "provider stack trace and ciphertext",
    status: 500,
  }));
  assert.equal(unknown.message.includes("provider stack trace"), false);
  assert.equal(unknown.message.includes("ciphertext"), false);
});

test("Channels UI covers eligibility, empty state, confirmation, permissions, and provider preservation", async () => {
  const page = await readFile(new URL("../components/sales-operator/ChannelsPage.tsx", import.meta.url), "utf8");
  const selection = await readFile(new URL("../components/sales-operator/InstagramAssetSelection.tsx", import.meta.url), "utf8");
  const card = await readFile(new URL("../components/sales-operator/ChannelConnectionCard.tsx", import.meta.url), "utf8");

  assert.match(page, /eligible professional account linked through Meta/);
  assert.match(selection, /No eligible Instagram business accounts were returned/);
  assert.match(selection, /automated replies will remain off/i);
  assert.match(selection, /instagramAuthorization\.error\.remediation/);
  assert.match(card, /Enable automated replies\?/);
  assert.match(card, /CRM customers, leads, conversations, messages, and audit history are not deleted/);
  assert.match(card, /sales_operator\.channel\.manage/);
  assert.match(page, /facebookConnections/);
  assert.match(page, /telegramConnections/);
  assert.match(page, /otherConnections/);
});

test("OAuth query data is consumed, replaced, and excluded from auth return persistence", async () => {
  const selection = await readFile(new URL("../components/sales-operator/InstagramAssetSelection.tsx", import.meta.url), "utf8");
  const auth = await readFile(new URL("../src/providers/auth-provider.tsx", import.meta.url), "utf8");
  const layout = await readFile(new URL("../app/sales-operator/layout.tsx", import.meta.url), "utf8");

  assert.match(selection, /router\.replace\(INSTAGRAM_RETURN_PATH/);
  assert.match(selection, /const removeOAuthQuery/);
  assert.match(selection, /window\.history\.replaceState\(window\.history\.state, "", INSTAGRAM_RETURN_PATH\)/);
  assert.match(selection, /window\.setTimeout\(removeOAuthQuery, 250\)/);
  assert.match(selection, /consumedRef/);
  assert.match(layout, /preserveSearchParams=\{false\}/);
  assert.match(auth, /preserveSearchParams \? searchParams\.toString\(\) : ""/);
  assert.doesNotMatch(selection, /localStorage|sessionStorage|console\.|analytics|telemetry/);
});

test("workspace switching clears temporary authorization and stale results cannot populate another workspace", async () => {
  const provider = await readFile(new URL("../src/providers/sales-operator-channels-provider.tsx", import.meta.url), "utf8");
  assert.match(provider, /clearInstagramAuthorization\(\);[\s\S]*void refreshChannels\(\)/);
  assert.match(provider, /activeController\.current\?\.abort\(\)/);
  assert.match(provider, /currentWorkspaceIdRef\.current !== workspaceId/);
  assert.match(provider, /connectionsWorkspaceId === currentWorkspaceId \? connections : \[\]/);
  assert.match(provider, /isKnownConnection\(visibleConnections, connectionId\)/);
  assert.match(provider, /agents\.sales_operator\.instagram_enabled/);
  assert.match(provider, /!instagramEnabled/);
  assert.doesNotMatch(provider, /fallbackWorkspace|workspaces\[0\]/);
});

test("duplicate begin, asset, confirm, and connection mutations are guarded", async () => {
  const provider = await readFile(new URL("../src/providers/sales-operator-channels-provider.tsx", import.meta.url), "utf8");
  assert.match(provider, /beginPromise\.current/);
  assert.match(provider, /assetLoadPromise\.current/);
  assert.match(provider, /confirmPromise\.current/);
  assert.match(provider, /connectionActionPromises\.current/);
  assert.match(provider, /activeConnectionAction\.current/);
});

test("frontend state and UI never handle OAuth codes, Meta tokens, grants, credentials, or raw IDs as primary copy", async () => {
  const provider = await readFile(new URL("../src/providers/sales-operator-channels-provider.tsx", import.meta.url), "utf8");
  const selection = await readFile(new URL("../components/sales-operator/InstagramAssetSelection.tsx", import.meta.url), "utf8");
  const card = await readFile(new URL("../components/sales-operator/ChannelConnectionCard.tsx", import.meta.url), "utf8");
  const combined = `${provider}\n${selection}\n${card}`;
  assert.doesNotMatch(combined, /authorizationCode|accessToken|credentialId|authorizationGrantId|ciphertext|grantedScopes/);
  assert.doesNotMatch(card, /connection\.externalAccountId/);
});

test("the exact Sales Operator package and worker model is used without a Sales Agent package", async () => {
  const api = await readFile(new URL("../src/api/sales-operator/index.ts", import.meta.url), "utf8");
  const shell = await readFile(new URL("../components/sales-operator/SalesOperatorShell.tsx", import.meta.url), "utf8");
  const files = `${api}\n${shell}`;
  assert.match(files, /ydeck\.sales-operator/);
  assert.match(files, /Sales Operator/);
  assert.match(files, /sales\.operator\.v1/);
  assert.match(files, /Sales Agent/);
  assert.doesNotMatch(files, /ydeck\.sales-agent/);
});

test("responsive and accessibility contracts are present on channel and asset controls", async () => {
  const styles = await readFile(new URL("../app/sales-operator/sales-operator.css", import.meta.url), "utf8");
  const selection = await readFile(new URL("../components/sales-operator/InstagramAssetSelection.tsx", import.meta.url), "utf8");
  const card = await readFile(new URL("../components/sales-operator/ChannelConnectionCard.tsx", import.meta.url), "utf8");
  assert.match(styles, /@media \(max-width: 1020px\)/);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /@media \(max-width: 480px\)/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(styles, /:focus-visible|:focus-within/);
  assert.match(selection, /<fieldset>/);
  assert.match(selection, /type="checkbox"/);
  assert.match(card, /aria-live="polite"/);
  assert.match(card, /ConfirmationDialog/);
});
