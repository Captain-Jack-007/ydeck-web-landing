import assert from "node:assert/strict";
import { test } from "node:test";
import type { AccountDesktopDevice } from "@/src/api/types";
import { getDesktopConnectionSummary, normalizePortalMediaUrl } from "@/src/lib/desktop-portal";

function device(input: Partial<AccountDesktopDevice> & Pick<AccountDesktopDevice, "id">): AccountDesktopDevice {
  return input;
}

test("Desktop connection summary reports the latest active device", () => {
  const summary = getDesktopConnectionSummary([
    device({ id: "older", name: "Office Mac", status: "active", lastSeenAt: "2026-07-10T10:00:00.000Z" }),
    device({ id: "latest", name: "Studio Mac", status: "active", lastSeenAt: "2026-07-18T10:00:00.000Z" }),
  ], "ready");

  assert.equal(summary.state, "connected");
  assert.equal(summary.activeCount, 2);
  assert.equal(summary.latestDevice?.id, "latest");
  assert.match(summary.title, /2 Desktop devices connected/);
});

test("Desktop connection summary distinguishes unavailable, revoked, and empty states", () => {
  assert.equal(getDesktopConnectionSummary([], "loading").state, "loading");
  assert.equal(getDesktopConnectionSummary([], "error").state, "unavailable");
  assert.equal(getDesktopConnectionSummary([], "ready").state, "not_connected");
  assert.equal(getDesktopConnectionSummary([device({ id: "revoked", status: "revoked" })], "ready").state, "attention");
});

test("portal media accepts HTTPS and local development URLs only", () => {
  assert.equal(
    normalizePortalMediaUrl("https://cdn.ydeck.app/walkthrough.mp4", "https://ydeck.app"),
    "https://cdn.ydeck.app/walkthrough.mp4",
  );
  assert.equal(
    normalizePortalMediaUrl("/walkthrough.mp4", "http://localhost:3005"),
    "http://localhost:3005/walkthrough.mp4",
  );
  assert.equal(normalizePortalMediaUrl("http://cdn.ydeck.app/walkthrough.mp4", "https://ydeck.app"), null);
  assert.equal(normalizePortalMediaUrl("javascript:alert(1)", "https://ydeck.app"), null);
});
