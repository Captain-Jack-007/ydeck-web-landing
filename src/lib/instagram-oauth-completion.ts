import type { SalesChannelConnection } from "@/src/api/sales-operator";

export const INSTAGRAM_COMPLETION_TTL_MS = 10 * 60 * 1000;
export const INSTAGRAM_DESKTOP_CHANNELS_URL = "ydeck://sales-operator/channels" as const;

const STORAGE_KEY = "ydeck.instagram.oauth-completion";
const CONNECTED_RECEIPT_KEY = "ydeck.instagram.connected-receipt";
const SAFE_IDENTIFIER = /^[A-Za-z0-9._~-]+$/;

export type InstagramCompletionContext = {
  authorizationSessionId: string;
  flowWorkspaceId: string | null;
  expiresAt: number;
  selectedExternalAccountIds?: string[];
  confirmationStarted?: boolean;
};

export type InstagramConnectedReceipt = {
  workspaceId: string;
  externalAccountIds: string[];
  expiresAt: number;
};

export type InstagramCompletionState =
  | "INITIALIZING"
  | "AUTH_REQUIRED"
  | "LOADING_ASSETS"
  | "ASSET_SELECTION"
  | "CONFIRMING"
  | "VERIFYING_CHANNEL"
  | "CONNECTED"
  | "CANCELLED"
  | "ERROR"
  | "EXPIRED";

export type InstagramErrorReason =
  | "cancelled"
  | "invalid_state"
  | "expired_state"
  | "permission_missing"
  | "account_not_found"
  | "provider_error"
  | "connection_failed"
  | "unknown";

const ERROR_COPY: Record<InstagramErrorReason, { title: string; message: string; state: InstagramCompletionState }> = {
  cancelled: {
    title: "Instagram connection cancelled",
    message: "Instagram connection was cancelled. No account was connected.",
    state: "CANCELLED",
  },
  invalid_state: {
    title: "Connection request no longer valid",
    message: "This Instagram connection request is no longer valid. Start again from YDeck.",
    state: "ERROR",
  },
  expired_state: {
    title: "Connection request expired",
    message: "This Instagram connection request has expired. Start again from YDeck.",
    state: "EXPIRED",
  },
  permission_missing: {
    title: "Permissions are required",
    message: "YDeck did not receive all permissions required to manage Instagram messages.",
    state: "ERROR",
  },
  account_not_found: {
    title: "No eligible account found",
    message: "We couldn’t find an eligible Instagram Professional account.",
    state: "ERROR",
  },
  provider_error: {
    title: "Instagram is unavailable",
    message: "Instagram could not complete the connection right now. Try again from YDeck in a few minutes.",
    state: "ERROR",
  },
  connection_failed: {
    title: "Connection could not be completed",
    message: "YDeck couldn’t finish connecting Instagram. Return to YDeck and try again.",
    state: "ERROR",
  },
  unknown: {
    title: "Connection could not be completed",
    message: "YDeck couldn’t finish connecting Instagram. Return to YDeck and try again.",
    state: "ERROR",
  },
};

function isSafeIdentifier(value: string, maxLength: number) {
  return value.length > 0 && value.length <= maxLength && SAFE_IDENTIFIER.test(value);
}

export function parseInstagramCompletionContext(input: {
  metaStatus: string | null;
  authorizationSessionId: string | null;
  flowWorkspaceId: string | null;
}, now = Date.now()) {
  if (input.metaStatus !== "asset_selection_required") {
    return { ok: false as const, reason: "invalid_status" as const };
  }
  if (!input.authorizationSessionId || !isSafeIdentifier(input.authorizationSessionId, 1024)) {
    return { ok: false as const, reason: "invalid_session" as const };
  }
  if (input.flowWorkspaceId && !isSafeIdentifier(input.flowWorkspaceId, 256)) {
    return { ok: false as const, reason: "invalid_workspace" as const };
  }
  return {
    ok: true as const,
    context: {
      authorizationSessionId: input.authorizationSessionId,
      flowWorkspaceId: input.flowWorkspaceId,
      expiresAt: now + INSTAGRAM_COMPLETION_TTL_MS,
    } satisfies InstagramCompletionContext,
  };
}

function isStoredContext(value: unknown): value is InstagramCompletionContext {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<InstagramCompletionContext>;
  return (
    typeof candidate.authorizationSessionId === "string"
    && isSafeIdentifier(candidate.authorizationSessionId, 1024)
    && (candidate.flowWorkspaceId === null
      || (typeof candidate.flowWorkspaceId === "string" && isSafeIdentifier(candidate.flowWorkspaceId, 256)))
    && typeof candidate.expiresAt === "number"
    && Number.isFinite(candidate.expiresAt)
    && (candidate.selectedExternalAccountIds === undefined
      || (Array.isArray(candidate.selectedExternalAccountIds)
        && candidate.selectedExternalAccountIds.every((item) => typeof item === "string" && isSafeIdentifier(item, 256))))
    && (candidate.confirmationStarted === undefined || typeof candidate.confirmationStarted === "boolean")
  );
}

export function saveInstagramCompletionContext(context: InstagramCompletionContext) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(context));
}

export function readInstagramCompletionContext(now = Date.now()) {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isStoredContext(parsed) || parsed.expiresAt <= now) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearInstagramCompletionContext() {
  if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(STORAGE_KEY);
}

export function saveInstagramConnectedReceipt(receipt: InstagramConnectedReceipt) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(CONNECTED_RECEIPT_KEY, JSON.stringify(receipt));
}

export function readInstagramConnectedReceipt(now = Date.now()) {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(CONNECTED_RECEIPT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<InstagramConnectedReceipt>;
    const valid = (
      typeof parsed.workspaceId === "string"
      && isSafeIdentifier(parsed.workspaceId, 256)
      && Array.isArray(parsed.externalAccountIds)
      && parsed.externalAccountIds.length > 0
      && parsed.externalAccountIds.every((item) => typeof item === "string" && isSafeIdentifier(item, 256))
      && typeof parsed.expiresAt === "number"
      && Number.isFinite(parsed.expiresAt)
      && parsed.expiresAt > now
    );
    if (!valid) {
      sessionStorage.removeItem(CONNECTED_RECEIPT_KEY);
      return null;
    }
    return parsed as InstagramConnectedReceipt;
  } catch {
    sessionStorage.removeItem(CONNECTED_RECEIPT_KEY);
    return null;
  }
}

export function rememberConnectedInstagram(workspaceId: string, externalAccountIds: string[], now = Date.now()) {
  const receipt = { workspaceId, externalAccountIds: [...new Set(externalAccountIds)], expiresAt: now + INSTAGRAM_COMPLETION_TTL_MS };
  saveInstagramConnectedReceipt(receipt);
  clearInstagramCompletionContext();
  return receipt;
}

export function markInstagramConfirmationStarted(context: InstagramCompletionContext, selectedExternalAccountIds: string[]) {
  const next = {
    ...context,
    selectedExternalAccountIds: [...new Set(selectedExternalAccountIds)],
    confirmationStarted: true,
  };
  saveInstagramCompletionContext(next);
  return next;
}

export function captureInstagramCompletionContext(searchParams: URLSearchParams, now = Date.now()) {
  const parsed = parseInstagramCompletionContext({
    metaStatus: searchParams.get("metaStatus"),
    authorizationSessionId: searchParams.get("authorizationSessionId"),
    flowWorkspaceId: searchParams.get("flowWorkspaceId"),
  }, now);
  if (parsed.ok) saveInstagramCompletionContext(parsed.context);
  return parsed;
}

export function parseInstagramErrorReason(value: string | null | undefined): InstagramErrorReason {
  if (value && Object.hasOwn(ERROR_COPY, value) && value !== "unknown") {
    return value as Exclude<InstagramErrorReason, "unknown">;
  }
  return "unknown";
}

export function instagramErrorExperience(value: string | null | undefined) {
  const reason = parseInstagramErrorReason(value);
  return { reason, ...ERROR_COPY[reason] };
}

export function isConnectedInstagramChannel(connection: SalesChannelConnection) {
  return connection.provider === "instagram" && ["active", "connected"].includes(connection.status);
}

export function resolveConnectedInstagramChannel(
  connections: SalesChannelConnection[],
  expectedExternalAccountIds: string[] = [],
) {
  const connected = connections.filter(isConnectedInstagramChannel);
  if (expectedExternalAccountIds.length === 0) return connected[0] ?? null;
  const expected = new Set(expectedExternalAccountIds);
  return connected.find((connection) => expected.has(connection.externalAccountId)) ?? null;
}

export function isDesktopDeepLinkEnabled() {
  return process.env.NEXT_PUBLIC_YDECK_DESKTOP_DEEP_LINK_ENABLED === "true";
}

export function isInstagramSessionExpiredCode(code: string) {
  return [
    "META_AUTH_EXPIRED",
    "META_AUTHORIZATION_SESSION_EXPIRED",
    "AUTHORIZATION_SESSION_EXPIRED",
    "OAUTH_COMPLETION_SESSION_EXPIRED",
  ].includes(code);
}
