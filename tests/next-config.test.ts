import assert from "node:assert/strict";
import { test } from "node:test";
import createNextConfig, { resolveApiProxyTarget } from "../next.config.mjs";

test("development API proxy targets the local YDeck server", () => {
  assert.equal(resolveApiProxyTarget("phase-development-server", ""), "http://localhost:8085");
});

test("production API proxy targets YDeck Cloud", () => {
  assert.equal(resolveApiProxyTarget("phase-production-build", ""), "https://api.ydeck.app");
});

test("API proxy accepts an explicit server-side override", () => {
  assert.equal(resolveApiProxyTarget("phase-development-server", "http://localhost:3030/"), "http://localhost:3030");
});

test("API proxy rejects unsupported protocols", () => {
  assert.throws(
    () => resolveApiProxyTarget("phase-development-server", "file:///tmp/api"),
    /must use HTTP or HTTPS/,
  );
});

test("report-template thumbnail assets are proxied through the trusted API origin", async () => {
  const config = createNextConfig("phase-development-server");
  assert.equal(typeof config.rewrites, "function");
  const rewritesFactory = config.rewrites;
  if (typeof rewritesFactory !== "function") {
    throw new Error("Expected Next config rewrites to be a function.");
  }
  const rewrites = await rewritesFactory();

  assert.deepEqual(rewrites, [
    {
      source: "/api/v1/:path*",
      destination: "http://localhost:8085/api/v1/:path*",
    },
    {
      source: "/assets/report-templates/:path*",
      destination: "http://localhost:8085/assets/report-templates/:path*",
    },
  ]);
});
