import { apiRequest } from "@/src/api/client";

export const SALES_OPERATOR_PACKAGE_ID = "ydeck.sales-operator" as const;
export const SALES_OPERATOR_DISPLAY_NAME = "Sales Operator" as const;
export const SALES_OPERATOR_WORKER_ID = "sales.operator.v1" as const;
export const SALES_OPERATOR_WORKER_DISPLAY_NAME = "Sales Agent" as const;

export type SalesChannelProvider = "instagram" | "facebook" | "telegram" | string;

export type SalesChannelConnection = {
  id: string;
  provider: SalesChannelProvider;
  status: string;
  externalAccountId: string;
  accountName: string;
  username: string | null;
  imageUrl: string | null;
  linkedBusinessName: string | null;
  capabilities: string[];
  inboundIngestionEnabled: boolean;
  automatedRepliesEnabled: boolean;
  connectedAt: string | null;
  disconnectedAt: string | null;
  authorizationExpiresAt: string | null;
  lastInboundEventAt: string | null;
  lastOutboundDeliveryAt: string | null;
  lastHealthCheckAt: string | null;
  lastHealthyAt: string | null;
  lastErrorAt: string | null;
  safeErrorCode: string | null;
  safeErrorMessage: string | null;
  revision: number;
};

export type InstagramAsset = {
  provider: "instagram";
  externalAccountId: string;
  name: string;
  username: string | null;
  imageUrl: string | null;
  linkedBusinessName: string | null;
  capabilities: string[];
  tokenExpiresAt: string | null;
};

type BeginMetaAuthorizationResponse = {
  authorizationSessionId: string;
  authorizationUrl: string;
  expiresAt: string;
};

function basePath(workspaceId: string) {
  return `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/sales-operator`;
}

export function listChannelConnections(workspaceId: string, signal?: AbortSignal) {
  return apiRequest<{ connections: SalesChannelConnection[] }>(`${basePath(workspaceId)}/channels`, { signal });
}

export function beginInstagramAuthorization(workspaceId: string, redirectTarget: string) {
  return apiRequest<BeginMetaAuthorizationResponse>(`${basePath(workspaceId)}/channels/meta/begin`, {
    method: "POST",
    body: { provider: "instagram", redirectTarget },
  });
}

export function listInstagramAssets(
  workspaceId: string,
  authorizationSessionId: string,
  signal?: AbortSignal,
) {
  const query = new URLSearchParams({
    provider: "instagram",
    authorizationSessionId,
  });
  return apiRequest<{ assets: InstagramAsset[] }>(`${basePath(workspaceId)}/channels/meta/assets?${query.toString()}`, { signal });
}

export function confirmInstagramAssets(
  workspaceId: string,
  authorizationSessionId: string,
  externalAccountIds: string[],
) {
  return apiRequest<{ connections: SalesChannelConnection[] }>(`${basePath(workspaceId)}/channels/meta/confirm`, {
    method: "POST",
    body: {
      authorizationSessionId,
      provider: "instagram",
      externalAccountIds,
    },
  });
}

export function testChannelConnection(workspaceId: string, connectionId: string) {
  return apiRequest<SalesChannelConnection>(`${basePath(workspaceId)}/channels/${encodeURIComponent(connectionId)}/test`, {
    method: "POST",
  });
}

export function refreshChannelAuthorization(workspaceId: string, connectionId: string) {
  return apiRequest<SalesChannelConnection>(`${basePath(workspaceId)}/channels/${encodeURIComponent(connectionId)}/refresh`, {
    method: "POST",
  });
}

export function pauseChannel(workspaceId: string, connectionId: string) {
  return apiRequest<SalesChannelConnection>(`${basePath(workspaceId)}/channels/${encodeURIComponent(connectionId)}/pause`, {
    method: "POST",
  });
}

export function resumeChannel(workspaceId: string, connectionId: string) {
  return apiRequest<SalesChannelConnection>(`${basePath(workspaceId)}/channels/${encodeURIComponent(connectionId)}/resume`, {
    method: "POST",
  });
}

export function updateChannelSettings(workspaceId: string, connectionId: string, automatedRepliesEnabled: boolean) {
  return apiRequest<SalesChannelConnection>(`${basePath(workspaceId)}/channels/${encodeURIComponent(connectionId)}/settings`, {
    method: "PATCH",
    body: { automatedRepliesEnabled },
  });
}

export function disconnectChannel(workspaceId: string, connectionId: string) {
  return apiRequest<null>(`${basePath(workspaceId)}/channels/${encodeURIComponent(connectionId)}`, {
    method: "DELETE",
  });
}

export async function reloadSalesOperatorDependents(workspaceId: string, signal?: AbortSignal) {
  const path = basePath(workspaceId);
  return Promise.allSettled([
    apiRequest<unknown>(`${path}/overview`, { signal }),
    apiRequest<unknown>(`${path}/runtime`, { signal }),
    apiRequest<unknown>(`${path}/configuration`, { signal }),
  ]);
}
