import { YDeckApiError } from "@/src/api/client";
import type { InstagramAsset, SalesChannelConnection } from "@/src/api/sales-operator";

export const INSTAGRAM_CALLBACK_STATUS = "asset_selection_required" as const;
export const INSTAGRAM_RETURN_PATH = "/sales-operator/channels/instagram/return" as const;

const SAFE_ERROR_COPY: Record<string, { message: string; remediation: string; retryable: boolean }> = {
  META_AUTH_CANCELLED: {
    message: "Instagram authorization was cancelled.",
    remediation: "Start the connection again when you are ready.",
    retryable: true,
  },
  META_AUTH_STATE_INVALID: {
    message: "This Instagram authorization request is invalid or has already been used.",
    remediation: "Start a new Instagram connection.",
    retryable: true,
  },
  META_AUTH_EXPIRED: {
    message: "This Instagram authorization request expired.",
    remediation: "Start a new Instagram connection.",
    retryable: true,
  },
  META_PERMISSION_MISSING: {
    message: "Required Meta messaging permissions were not approved.",
    remediation: "Reconnect Instagram and approve the requested permissions.",
    retryable: true,
  },
  META_AUTHORIZATION_REVOKED: {
    message: "Meta authorization for this account was revoked.",
    remediation: "Reconnect the Instagram account.",
    retryable: true,
  },
  META_ACCOUNT_ALREADY_CONNECTED: {
    message: "This Instagram account is already connected to another workspace.",
    remediation: "Disconnect it from the other workspace before connecting it here.",
    retryable: false,
  },
  INSTAGRAM_ACCOUNT_NOT_ELIGIBLE: {
    message: "The selected Instagram account is not eligible for business messaging.",
    remediation: "Confirm it is a professional account linked through Meta's supported business configuration.",
    retryable: false,
  },
  INSTAGRAM_SUBSCRIPTION_FAILED: {
    message: "Instagram could not finish the messaging subscription.",
    remediation: "Try again. If the problem continues, contact YDeck support.",
    retryable: true,
  },
  INSTAGRAM_DELIVERY_RESTRICTED: {
    message: "Instagram currently restricts message delivery for this account.",
    remediation: "Review the account in Meta and retry after the restriction is resolved.",
    retryable: false,
  },
  AUTH_EXPIRED: {
    message: "The channel authorization expired.",
    remediation: "Reconnect the affected account.",
    retryable: true,
  },
  AUTH_REVOKED: {
    message: "The channel authorization was revoked.",
    remediation: "Reconnect the affected account.",
    retryable: true,
  },
  PERMISSION_MISSING: {
    message: "A required channel permission is missing.",
    remediation: "Reconnect and approve the required permissions.",
    retryable: true,
  },
  PROVIDER_RATE_LIMITED: {
    message: "The provider rate limit was reached.",
    remediation: "Wait briefly, then try again.",
    retryable: true,
  },
  PROVIDER_TEMPORARILY_UNAVAILABLE: {
    message: "The messaging provider is temporarily unavailable.",
    remediation: "Try again in a few minutes.",
    retryable: true,
  },
  PROVIDER_UNAVAILABLE: {
    message: "The messaging provider is temporarily unavailable.",
    remediation: "Try again in a few minutes.",
    retryable: true,
  },
  CHANNEL_CONFIGURATION_INCOMPLETE: {
    message: "The channel configuration is incomplete.",
    remediation: "Complete Sales Operator setup and retry this action.",
    retryable: false,
  },
  KNOWLEDGE_NOT_APPROVED: {
    message: "Approved business knowledge is required before automated replies can start.",
    remediation: "Add and approve at least one knowledge source for Sales Agent.",
    retryable: false,
  },
  SALES_OPERATOR_FEATURE_DISABLED: {
    message: "This Sales Operator capability is not enabled for the workspace.",
    remediation: "Ask a workspace administrator or YDeck support to enable the capability.",
    retryable: false,
  },
  WORKSPACE_PERMISSION_REQUIRED: {
    message: "You do not have permission to manage Sales Operator channels in this workspace.",
    remediation: "Ask a workspace administrator for channel-management access.",
    retryable: false,
  },
};

export type SafeChannelError = {
  code: string;
  message: string;
  remediation: string;
  retryable: boolean;
  requestId: string | null;
};

export function safeSalesOperatorError(error: unknown): SafeChannelError {
  const apiError = error instanceof YDeckApiError ? error : null;
  const code = apiError?.code ?? "UNKNOWN";
  const known = SAFE_ERROR_COPY[code];
  return {
    code,
    message: known?.message ?? "The Sales Operator request could not be completed safely.",
    remediation: known?.remediation ?? "Try again. If the problem continues, contact YDeck support.",
    retryable: apiError?.retryable ?? known?.retryable ?? true,
    requestId: apiError?.requestId ?? null,
  };
}

export function safeSalesOperatorErrorCode(code: string, requestId: string | null = null): SafeChannelError {
  const known = SAFE_ERROR_COPY[code];
  return {
    code,
    message: known?.message ?? "This channel needs attention.",
    remediation: known?.remediation ?? "Retry the connection check. If the problem continues, contact YDeck support.",
    retryable: known?.retryable ?? true,
    requestId,
  };
}

export function buildInstagramReturnUrl(approvedOrigin: string, workspaceId: string) {
  const origin = new URL(approvedOrigin);
  if (origin.protocol !== "https:") {
    throw new Error("Instagram connection requires an approved HTTPS web origin.");
  }
  const target = new URL(INSTAGRAM_RETURN_PATH, origin.origin);
  target.searchParams.set("flowWorkspaceId", workspaceId);
  return target.toString();
}

export function validateCloudAuthorizationUrl(value: string) {
  const parsed = new URL(value);
  if (parsed.protocol !== "https:") {
    throw new Error("Cloud returned an invalid authorization URL.");
  }
  return value;
}

export function parseInstagramCallback(input: {
  metaStatus: string | null;
  authorizationSessionId: string | null;
  flowWorkspaceId: string | null;
}) {
  if (input.metaStatus !== INSTAGRAM_CALLBACK_STATUS) {
    return { ok: false as const, reason: "invalid_status" as const };
  }
  if (!input.authorizationSessionId || input.authorizationSessionId.length > 80) {
    return { ok: false as const, reason: "invalid_session" as const };
  }
  if (!input.flowWorkspaceId) {
    return { ok: false as const, reason: "missing_workspace" as const };
  }
  return {
    ok: true as const,
    authorizationSessionId: input.authorizationSessionId,
    flowWorkspaceId: input.flowWorkspaceId,
  };
}

export function normalizeConnectionStatus(status: string) {
  if (status === "active") return { label: "Connected", tone: "success" };
  if (status === "paused") return { label: "Paused", tone: "warning" };
  if (["connecting", "account_selection_required"].includes(status)) return { label: "Connecting", tone: "neutral" };
  if (status === "authorization_expired") return { label: "Authorization expired", tone: "danger" };
  if (status === "disconnected") return { label: "Disconnected", tone: "neutral" };
  return { label: "Needs attention", tone: "danger" };
}

export function providerLabel(provider: string) {
  if (provider === "instagram") return "Instagram";
  if (provider === "facebook") return "Facebook Messenger";
  if (provider === "telegram") return "Telegram";
  return "Connected channel";
}

export function safeProviderImageUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

export function isAuthorizationWarning(expiresAt: string | null, now = Date.now()) {
  if (!expiresAt) return false;
  const expiry = Date.parse(expiresAt);
  return Number.isFinite(expiry) && expiry > now && expiry - now <= 14 * 24 * 60 * 60 * 1000;
}

export function isKnownConnection(connections: SalesChannelConnection[], connectionId: string) {
  return connections.some((connection) => connection.id === connectionId);
}

export function sanitizeInstagramAssets(assets: InstagramAsset[]) {
  return assets.map((asset) => ({
    provider: "instagram" as const,
    externalAccountId: asset.externalAccountId,
    name: asset.name,
    username: asset.username ?? null,
    imageUrl: safeProviderImageUrl(asset.imageUrl),
    linkedBusinessName: asset.linkedBusinessName ?? null,
    capabilities: Array.isArray(asset.capabilities) ? asset.capabilities.filter((item): item is string => typeof item === "string") : [],
    tokenExpiresAt: asset.tokenExpiresAt ?? null,
  }));
}
