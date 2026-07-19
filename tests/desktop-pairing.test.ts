import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { YDeckApiError } from "@/src/api/client";
import {
  formatPairingCodeInput,
  isCompletePairingCode,
  mapPairingDecisionError,
} from "@/src/lib/desktop-pairing";

test("Desktop pairing codes are normalized to the server display format", () => {
  assert.equal(formatPairingCodeInput("ab cd-ef 123456"), "ABCDEF-123456");
  assert.equal(isCompletePairingCode("ABCDEF-123456"), true);
  assert.equal(isCompletePairingCode("ABC123"), false);
});

test("Desktop pairing terminal errors map to explicit UI states", () => {
  const expired = mapPairingDecisionError(new YDeckApiError({
    code: "PAIRING_EXPIRED",
    message: "expired",
    status: 410,
    requestId: "req_expired",
  }));
  const used = mapPairingDecisionError(new YDeckApiError({
    code: "PAIRING_ALREADY_USED",
    message: "used",
    status: 409,
  }));
  const denied = mapPairingDecisionError(new YDeckApiError({
    code: "PAIRING_DENIED",
    message: "denied",
    status: 403,
  }));

  assert.equal(expired.status, "expired");
  assert.equal("requestId" in expired ? expired.requestId : null, "req_expired");
  assert.equal(used.status, "already_used");
  assert.equal(denied.status, "denied");
});

test("Desktop pairing rate limits expose a bounded retry time", () => {
  const before = Date.now();
  const decision = mapPairingDecisionError(new YDeckApiError({
    code: "PAIRING_RATE_LIMITED",
    message: "slow down",
    status: 429,
    retryAfter: 12,
  }));

  assert.equal(decision.status, "rate_limited");
  assert.ok("retryAt" in decision && decision.retryAt !== undefined);
  assert.ok("retryAt" in decision && decision.retryAt! >= before + 11_000);
});

test("production verification route delegates to the pairing experience", async () => {
  const source = await readFile(new URL("../app/desktop/verify/page.tsx", import.meta.url), "utf8");

  assert.match(source, /\.\.\/\.\.\/desktop\/pairing\/page/);
});
