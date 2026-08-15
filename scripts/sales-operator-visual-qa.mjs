import fs from "node:fs/promises";
import path from "node:path";

const debugOrigin = process.env.YDECK_QA_DEBUG_ORIGIN ?? "http://127.0.0.1:9223";
const appOrigin = process.env.YDECK_QA_APP_ORIGIN ?? "http://127.0.0.1:3006";
const outputDir = path.resolve("artifacts/sales-operator-qa");

const user = {
  id: "user-qa",
  displayName: "Morgan Lee",
  primaryEmail: "morgan@ydeck.local",
  avatarUrl: null,
};

const workspace = {
  id: "workspace-a",
  name: "Northstar Retail Operations",
  type: "organization",
  status: "active",
  role: "admin",
  isCurrent: true,
};

const baseConnection = {
  externalAccountId: "not-rendered",
  imageUrl: null,
  linkedBusinessName: "Northstar Retail",
  capabilities: ["receive_messages", "send_text"],
  inboundIngestionEnabled: true,
  automatedRepliesEnabled: false,
  connectedAt: "2026-08-01T09:00:00.000Z",
  disconnectedAt: null,
  authorizationExpiresAt: "2026-08-22T09:00:00.000Z",
  lastInboundEventAt: "2026-08-15T08:42:00.000Z",
  lastOutboundDeliveryAt: "2026-08-15T08:43:00.000Z",
  lastHealthCheckAt: "2026-08-15T09:00:00.000Z",
  lastHealthyAt: "2026-08-15T09:00:00.000Z",
  lastErrorAt: null,
  safeErrorCode: null,
  safeErrorMessage: null,
  revision: 1,
};

const scenarios = {
  empty: {
    permissions: ["workspace.read", "sales_operator.channel.manage"],
    connections: [],
  },
  connected: {
    permissions: ["workspace.read", "sales_operator.channel.manage"],
    connections: [{
      ...baseConnection,
      id: "ig-active",
      provider: "instagram",
      status: "active",
      accountName: "Northstar Home & Living — Tashkent Flagship",
      username: "northstar.home.uz",
    }],
  },
  attention: {
    permissions: ["workspace.read", "sales_operator.channel.manage"],
    connections: [
      {
        ...baseConnection,
        id: "ig-paused",
        provider: "instagram",
        status: "paused",
        accountName: "Northstar Home & Living — Wholesale and Commercial Orders",
        username: "northstar.wholesale.central.asia",
        automatedRepliesEnabled: true,
      },
      {
        ...baseConnection,
        id: "ig-degraded",
        provider: "instagram",
        status: "degraded",
        accountName: "Northstar Seasonal Campaigns",
        username: "northstar.seasonal",
        lastHealthyAt: "2026-08-12T09:00:00.000Z",
        lastErrorAt: "2026-08-15T08:58:00.000Z",
        safeErrorCode: "PROVIDER_TEMPORARILY_UNAVAILABLE",
      },
      {
        ...baseConnection,
        id: "ig-expired",
        provider: "instagram",
        status: "authorization_expired",
        accountName: "Northstar Outlet",
        username: "northstar.outlet",
        authorizationExpiresAt: "2026-08-10T09:00:00.000Z",
        safeErrorCode: "AUTH_EXPIRED",
      },
    ],
  },
  disabled: {
    permissions: ["workspace.read"],
    connections: [{
      ...baseConnection,
      id: "ig-readonly",
      provider: "instagram",
      status: "active",
      accountName: "Northstar Home & Living",
      username: "northstar.home",
    }],
  },
  featureDisabled: {
    permissions: ["workspace.read", "sales_operator.channel.manage"],
    instagramEnabled: false,
    connections: [{
      ...baseConnection,
      id: "ig-feature-disabled",
      provider: "instagram",
      status: "active",
      accountName: "Northstar Home & Living",
      username: "northstar.home",
    }],
  },
  selection: {
    permissions: ["workspace.read", "sales_operator.channel.manage"],
    connections: [],
    assets: [
      {
        provider: "instagram",
        externalAccountId: "ig-asset-1",
        name: "Northstar Home & Living — Tashkent Flagship",
        username: "northstar.home.uz",
        imageUrl: null,
        linkedBusinessName: "Northstar Retail Operations Central Asia",
        capabilities: ["receive_messages", "send_text"],
        tokenExpiresAt: "2026-10-15T09:00:00.000Z",
      },
      {
        provider: "instagram",
        externalAccountId: "ig-asset-2",
        name: "Northstar Outlet and Clearance Store with a Very Long Account Name",
        username: "northstar.outlet.clearance.central.asia",
        imageUrl: null,
        linkedBusinessName: "Northstar Retail Operations Central Asia and Regional Franchises",
        capabilities: ["receive_messages", "send_text"],
        tokenExpiresAt: null,
      },
      {
        provider: "instagram",
        externalAccountId: "ig-asset-3",
        name: "Northstar Wholesale",
        username: null,
        imageUrl: null,
        linkedBusinessName: null,
        capabilities: ["receive_messages"],
        tokenExpiresAt: null,
      },
    ],
  },
  noAssets: {
    permissions: ["workspace.read", "sales_operator.channel.manage"],
    connections: [],
    assets: [],
  },
};

class Cdp {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (pending) {
          this.pending.delete(message.id);
          if (message.error) pending.reject(new Error(message.error.message));
          else pending.resolve(message.result);
        }
        return;
      }
      for (const listener of this.listeners.get(message.method) ?? []) listener(message.params);
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  on(method, listener) {
    const listeners = this.listeners.get(method) ?? [];
    listeners.push(listener);
    this.listeners.set(method, listeners);
  }

  close() {
    this.ws.close();
  }
}

function responseFor(urlString, scenario) {
  const url = new URL(urlString);
  const route = url.pathname;
  if (route === "/api/v1/auth/refresh") return { status: 200, body: { accessToken: "qa-access-token" } };
  if (route === "/api/v1/me") return { status: 200, body: user };
  if (route === "/api/v1/workspaces/current") return {
    status: 200,
    body: { workspace, membership: { role: "admin", status: "active" }, permissions: scenario.permissions },
  };
  if (route === "/api/v1/workspaces") return { status: 200, body: [workspace] };
  if (route.endsWith("/billing")) return {
    status: 200,
    body: {
      workspaceId: workspace.id,
      availableActions: {},
      subscription: { planKey: "pilot", planName: "Pilot", status: "active" },
      entitlements: { booleans: { "agents.sales_operator.instagram_enabled": scenario.instagramEnabled ?? true } },
    },
  };
  if (route === "/api/v1/plans") return { status: 200, body: [] };
  if (route.endsWith("/devices")) return { status: 200, body: { devices: [] } };
  if (route.endsWith("/sales-operator/channels")) return { status: 200, body: { connections: scenario.connections } };
  if (route.endsWith("/sales-operator/channels/meta/assets")) return { status: 200, body: { assets: scenario.assets ?? [] } };
  if (route.endsWith("/sales-operator/overview")) return { status: 200, body: {} };
  if (route.endsWith("/sales-operator/runtime")) return { status: 200, body: {} };
  if (route.endsWith("/sales-operator/configuration")) return { status: 200, body: { configuration: {}, completedSteps: [] } };
  return { status: 404, body: { error: { code: "QA_NOT_MOCKED", message: "Not mocked" } } };
}

async function createPage() {
  const created = await fetch(`${debugOrigin}/json/new?about:blank`, { method: "PUT" }).then((response) => response.json());
  const cdp = new Cdp(created.webSocketDebuggerUrl);
  await cdp.open();
  await Promise.all([
    cdp.send("Page.enable"),
    cdp.send("Network.enable"),
    cdp.send("Runtime.enable"),
    cdp.send("Fetch.enable", { patterns: [{ urlPattern: "*/api/v1/*", requestStage: "Request" }] }),
  ]);
  return cdp;
}

async function waitFor(cdp, expression, timeoutMs = 10000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const result = await cdp.send("Runtime.evaluate", { expression, returnByValue: true });
    if (result.result.value) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${expression}`);
}

async function inspectScenario(name, scenario, viewport, options = {}) {
  const cdp = await createPage();
  cdp.on("Fetch.requestPaused", async ({ requestId, request }) => {
    const response = responseFor(request.url, scenario);
    await cdp.send("Fetch.fulfillRequest", {
      requestId,
      responseCode: response.status,
      responseHeaders: [{ name: "content-type", value: "application/json" }],
      body: Buffer.from(JSON.stringify(response.body)).toString("base64"),
    });
  });
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.mobile ?? false,
  });
  await cdp.send("Network.setCookie", { name: "ydeck_csrf", value: "qa", url: appOrigin });
  const route = options.route ?? "/sales-operator/channels";
  await cdp.send("Page.navigate", { url: `${appOrigin}${route}` });
  try {
    await waitFor(cdp, options.waitExpression ?? "document.querySelector('.channels-header') !== null");
    if (route.startsWith("/sales-operator/channels/instagram/return?")) {
      await waitFor(cdp, "location.search === ''");
    }
  } catch (error) {
    const diagnostics = await cdp.send("Runtime.evaluate", {
      expression: `({ pathname: location.pathname, title: document.title, text: document.body.innerText.slice(0, 1200), html: document.body.innerHTML.slice(0, 1200) })`,
      returnByValue: true,
    });
    console.error(JSON.stringify(diagnostics.result.value, null, 2));
    throw error;
  }
  if (options.clickExpression) {
    await cdp.send("Runtime.evaluate", { expression: options.clickExpression });
    await waitFor(cdp, options.afterClickWait ?? "document.querySelector('.account-dialog') !== null");
  }
  await new Promise((resolve) => setTimeout(resolve, 250));
  const metrics = await cdp.send("Runtime.evaluate", {
    expression: `(() => ({
      title: document.title,
      url: location.href,
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      height: document.documentElement.clientHeight,
      scrollHeight: document.documentElement.scrollHeight,
      text: document.body.innerText.slice(0, 4000),
      dialogs: document.querySelectorAll('[role="dialog"]').length,
      disabledButtons: [...document.querySelectorAll('button:disabled')].map((el) => el.textContent.trim()),
      disabledInputs: [...document.querySelectorAll('input:disabled')].map((el) => el.getAttribute('type') || el.tagName.toLowerCase()),
      cards: document.querySelectorAll('.channel-card').length,
      assets: document.querySelectorAll('.instagram-asset').length
    }))()`,
    returnByValue: true,
  });
  const screenshot = await cdp.send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
  const suffix = viewport.name ? `-${viewport.name}` : "";
  await fs.writeFile(path.join(outputDir, `${name}${suffix}.png`), Buffer.from(screenshot.data, "base64"));
  cdp.close();
  return { name: `${name}${suffix}`, ...metrics.result.value };
}

await fs.mkdir(outputDir, { recursive: true });
const results = [];
results.push(await inspectScenario("empty", scenarios.empty, { name: "desktop", width: 1440, height: 1000 }));
results.push(await inspectScenario("connected", scenarios.connected, { name: "desktop", width: 1440, height: 1000 }));
results.push(await inspectScenario("attention", scenarios.attention, { name: "desktop", width: 1440, height: 1000 }));
results.push(await inspectScenario("disabled", scenarios.disabled, { name: "desktop", width: 1440, height: 1000 }));
results.push(await inspectScenario("feature-disabled", scenarios.featureDisabled, { name: "desktop", width: 1440, height: 1000 }));
results.push(await inspectScenario("connected", scenarios.connected, { name: "tablet", width: 820, height: 1180 }));
results.push(await inspectScenario("connected", scenarios.connected, { name: "mobile", width: 390, height: 844, mobile: true }));
results.push(await inspectScenario("disconnect", scenarios.connected, { name: "desktop", width: 1440, height: 1000 }, {
  clickExpression: `([...document.querySelectorAll('button')].find((button) => button.textContent.includes('Disconnect'))?.click(), true)`,
}));
const callbackQuery = "?metaStatus=asset_selection_required&authorizationSessionId=authorization-session&flowWorkspaceId=workspace-a";
results.push(await inspectScenario("selection", scenarios.selection, { name: "desktop", width: 1440, height: 1000 }, {
  route: `/sales-operator/channels/instagram/return${callbackQuery}`,
  waitExpression: "document.querySelectorAll('.instagram-asset').length === 3",
}));
results.push(await inspectScenario("selection", scenarios.selection, { name: "mobile", width: 390, height: 844, mobile: true }, {
  route: `/sales-operator/channels/instagram/return${callbackQuery}`,
  waitExpression: "document.querySelectorAll('.instagram-asset').length === 3",
}));
results.push(await inspectScenario("no-assets", scenarios.noAssets, { name: "desktop", width: 1440, height: 1000 }, {
  route: `/sales-operator/channels/instagram/return${callbackQuery}`,
  waitExpression: "document.body.innerText.includes('No eligible Instagram business accounts')",
}));
await fs.writeFile(path.join(outputDir, "results.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
