import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveApiProxyTarget } from "../next.config.mjs";

test("development API proxy targets the local YDeck server", () => {
  assert.equal(resolveApiProxyTarget("phase-development-server", ""), "http://127.0.0.1:2026");
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
