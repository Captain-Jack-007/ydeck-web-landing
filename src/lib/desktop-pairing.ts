import { getHumanErrorMessage, YDeckApiError } from "@/src/api/client";
import type { PairingApprovalResponse } from "@/src/api/types";

export type PairingDecision =
  | { status: "idle" }
  | { status: "approved"; response: PairingApprovalResponse }
  | { status: "denied" }
  | {
      status: "invalid_code" | "expired" | "already_used" | "not_found" | "rate_limited" | "internal_error";
      message: string;
      requestId: string | null;
      retryAt?: number;
    };

export type PairingFailureDecision = Extract<PairingDecision, { message: string }>;

export function isPairingFailureDecision(decision: PairingDecision): decision is PairingFailureDecision {
  return "message" in decision;
}

export function formatPairingCodeInput(value: string) {
  const compact = value.toUpperCase().replace(/[^A-F0-9]/gu, "").slice(0, 12);
  return compact.length > 6 ? `${compact.slice(0, 6)}-${compact.slice(6)}` : compact;
}

export function isCompletePairingCode(value: string) {
  return value.replace(/[^A-F0-9]/giu, "").length === 12;
}

export function mapPairingDecisionError(error: unknown): PairingDecision {
  if (!(error instanceof YDeckApiError)) {
    return {
      status: "internal_error",
      message: "Something went wrong. Please try again.",
      requestId: null,
    };
  }

  const shared = {
    message: getHumanErrorMessage(error),
    requestId: error.requestId ?? null,
  };

  switch (error.code) {
    case "PAIRING_DENIED":
      return { status: "denied" };
    case "PAIRING_EXPIRED":
      return { status: "expired", ...shared };
    case "PAIRING_ALREADY_USED":
      return { status: "already_used", ...shared };
    case "PAIRING_NOT_FOUND":
      return { status: "not_found", ...shared };
    case "PAIRING_RATE_LIMITED":
    case "RATE_LIMITED":
      return {
        status: "rate_limited",
        ...shared,
        retryAt: Date.now() + (error.retryAfter ?? 60) * 1000,
      };
    default:
      return {
        status: "internal_error",
        ...shared,
      };
  }
}
