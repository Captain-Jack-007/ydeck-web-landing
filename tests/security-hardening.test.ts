import assert from "node:assert/strict";
import { test } from "node:test";
import { YDeckApiError, getHumanErrorMessage } from "@/src/api/client";
import { isAllowedBillingUrl, validateBillingRedirectUrl } from "@/src/lib/billing-url";

test("billing redirect validator only allows approved HTTPS hosts", () => {
  assert.equal(isAllowedBillingUrl("https://checkout.stripe.com/pay/cs_test_123"), true);
  assert.equal(isAllowedBillingUrl("http://checkout.stripe.com/pay/cs_test_123"), false);
  assert.equal(isAllowedBillingUrl("https://evil.example.com"), false);
});

test("billing redirect validation throws for disallowed hosts", () => {
  assert.throws(() => validateBillingRedirectUrl("https://evil.example.com"));
});

test("unknown api errors stay generic and include request id", () => {
  const error = new YDeckApiError({
    code: "INTERNAL_SOMETHING_NEW",
    message: "raw provider exception",
    status: 500,
    requestId: "req_abc123",
  });
  const message = getHumanErrorMessage(error);
  assert.match(message, /Something went wrong/);
  assert.match(message, /req_abc123/);
  assert.equal(message.includes("raw provider exception"), false);
});

test("registration conflicts use privacy-safe recovery copy", () => {
  const error = new YDeckApiError({
    code: "AUTH_REGISTRATION_UNAVAILABLE",
    message: "Registration cannot be completed",
    status: 409,
  });
  const message = getHumanErrorMessage(error);
  assert.match(message, /signing in or recovering access/i);
  assert.equal(message.includes("already exists"), false);
});

test("account deletion blockers use actionable safe copy", () => {
  const ownershipError = new YDeckApiError({
    code: "SOLE_WORKSPACE_OWNER",
    message: "internal membership details",
    status: 409,
  });
  const billingError = new YDeckApiError({
    code: "ACTIVE_SUBSCRIPTION_BLOCKS_DELETION",
    message: "provider subscription reference",
    status: 409,
  });

  assert.match(getHumanErrorMessage(ownershipError), /Transfer ownership/);
  assert.match(getHumanErrorMessage(billingError), /Cancel the active workspace subscription/);
  assert.equal(getHumanErrorMessage(ownershipError).includes("internal membership details"), false);
});
