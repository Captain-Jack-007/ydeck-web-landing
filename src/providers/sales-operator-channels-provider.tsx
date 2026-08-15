"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as salesOperatorApi from "@/src/api/sales-operator";
import type { InstagramAsset, SalesChannelConnection } from "@/src/api/sales-operator";
import {
  buildInstagramReturnUrl,
  isKnownConnection,
  safeSalesOperatorError,
  safeSalesOperatorErrorCode,
  sanitizeInstagramAssets,
  validateCloudAuthorizationUrl,
  type SafeChannelError,
} from "@/src/lib/sales-operator-channels";
import { useAuth } from "@/src/providers/auth-provider";
import { useBilling } from "@/src/providers/billing-provider";
import { useWorkspace } from "@/src/providers/workspace-provider";

type LoadStatus = "idle" | "loading" | "ready" | "error";
type ChannelAction = "test" | "refresh" | "pause" | "resume" | "automation" | "disconnect";

type InstagramAuthorizationState = {
  workspaceId: string;
  authorizationSessionId: string;
  assets: InstagramAsset[];
  status: LoadStatus;
  error: SafeChannelError | null;
};

type SalesOperatorChannelsContextValue = {
  status: LoadStatus;
  connections: SalesChannelConnection[];
  error: SafeChannelError | null;
  connectionActionError: { connectionId: string; error: SafeChannelError } | null;
  canManage: boolean;
  instagramEnabled: boolean;
  pendingAction: string | null;
  instagramAuthorization: InstagramAuthorizationState | null;
  refreshChannels: () => Promise<void>;
  beginInstagramConnection: () => Promise<void>;
  consumeInstagramCallback: (input: { workspaceId: string; authorizationSessionId: string }) => Promise<void>;
  clearInstagramAuthorization: () => void;
  confirmInstagramAssets: (externalAccountIds: string[]) => Promise<boolean>;
  testConnection: (connectionId: string) => Promise<void>;
  refreshAuthorization: (connectionId: string) => Promise<void>;
  pauseConnection: (connectionId: string) => Promise<void>;
  resumeConnection: (connectionId: string) => Promise<void>;
  setAutomatedReplies: (connectionId: string, enabled: boolean) => Promise<void>;
  disconnectConnection: (connectionId: string) => Promise<void>;
};

const SalesOperatorChannelsContext = createContext<SalesOperatorChannelsContextValue | null>(null);

function configuredWebOrigin() {
  return process.env.NEXT_PUBLIC_YDECK_WEB_ORIGIN ?? "https://ydeck.app";
}

export function SalesOperatorChannelsProvider({ children }: { children: ReactNode }) {
  const { status: authStatus } = useAuth();
  const { summary: billingSummary } = useBilling();
  const { workspace, cacheVersion, hasPermission } = useWorkspace();
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [connections, setConnections] = useState<SalesChannelConnection[]>([]);
  const [connectionsWorkspaceId, setConnectionsWorkspaceId] = useState<string | null>(null);
  const [error, setError] = useState<SafeChannelError | null>(null);
  const [connectionActionError, setConnectionActionError] = useState<{ connectionId: string; error: SafeChannelError } | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [instagramAuthorization, setInstagramAuthorization] = useState<InstagramAuthorizationState | null>(null);
  const requestVersion = useRef(0);
  const activeController = useRef<AbortController | null>(null);
  const beginPromise = useRef<Promise<void> | null>(null);
  const assetLoadPromise = useRef<Promise<void> | null>(null);
  const confirmPromise = useRef<Promise<boolean> | null>(null);
  const connectionActionPromises = useRef(new Map<string, Promise<void>>());
  const activeConnectionAction = useRef<string | null>(null);
  const currentWorkspaceId = workspace?.id ?? null;
  const currentWorkspaceIdRef = useRef(currentWorkspaceId);
  currentWorkspaceIdRef.current = currentWorkspaceId;
  const canManage = hasPermission("sales_operator.channel.manage");
  const billingSummaryMatchesWorkspace = !billingSummary?.workspaceId || billingSummary.workspaceId === currentWorkspaceId;
  const instagramEnabled = !billingSummaryMatchesWorkspace
    || billingSummary?.entitlements?.booleans?.["agents.sales_operator.instagram_enabled"] !== false;
  const instagramEnabledRef = useRef(instagramEnabled);
  instagramEnabledRef.current = instagramEnabled;

  const clearInstagramAuthorization = useCallback(() => {
    assetLoadPromise.current = null;
    confirmPromise.current = null;
    setInstagramAuthorization(null);
  }, []);

  const refreshChannels = useCallback(async () => {
    const workspaceId = currentWorkspaceId;
    const version = ++requestVersion.current;
    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;
    setConnections([]);
    setConnectionsWorkspaceId(null);
    setError(null);
    setConnectionActionError(null);
    if (authStatus !== "authenticated" || !workspaceId) {
      setStatus("idle");
      return;
    }
    setStatus("loading");
    try {
      const response = await salesOperatorApi.listChannelConnections(workspaceId, controller.signal);
      if (requestVersion.current !== version || currentWorkspaceIdRef.current !== workspaceId) return;
      setConnections(response.connections);
      setConnectionsWorkspaceId(workspaceId);
      setStatus("ready");
    } catch (loadError) {
      if (controller.signal.aborted || requestVersion.current !== version) return;
      setConnections([]);
      setConnectionsWorkspaceId(null);
      setError(safeSalesOperatorError(loadError));
      setStatus("error");
    }
  }, [authStatus, currentWorkspaceId]);

  useEffect(() => {
    clearInstagramAuthorization();
    setPendingAction(null);
    void refreshChannels();
    return () => activeController.current?.abort();
  }, [cacheVersion, clearInstagramAuthorization, refreshChannels]);

  useEffect(() => {
    if (!instagramEnabled) {
      assetLoadPromise.current = null;
      confirmPromise.current = null;
      setInstagramAuthorization((current) => current ? {
        workspaceId: current.workspaceId,
        authorizationSessionId: "",
        assets: [],
        status: "error",
        error: safeSalesOperatorErrorCode("SALES_OPERATOR_FEATURE_DISABLED"),
      } : current);
    }
  }, [instagramEnabled]);

  const refreshDependents = useCallback(async (workspaceId: string) => {
    await salesOperatorApi.reloadSalesOperatorDependents(workspaceId);
  }, []);

  const beginInstagramConnection = useCallback(async () => {
    if (beginPromise.current) return beginPromise.current;
    const workspaceId = currentWorkspaceId;
    if (!workspaceId || !canManage || !instagramEnabled) {
      setError(safeSalesOperatorError(new Error("Channel management is unavailable.")));
      return;
    }
    const run = (async () => {
      setPendingAction("instagram:begin");
      setError(null);
      clearInstagramAuthorization();
      try {
        const redirectTarget = buildInstagramReturnUrl(configuredWebOrigin(), workspaceId);
        const response = await salesOperatorApi.beginInstagramAuthorization(workspaceId, redirectTarget);
        if (currentWorkspaceIdRef.current !== workspaceId || !instagramEnabledRef.current) return;
        window.location.assign(validateCloudAuthorizationUrl(response.authorizationUrl));
      } catch (beginError) {
        if (currentWorkspaceIdRef.current === workspaceId && instagramEnabledRef.current) setError(safeSalesOperatorError(beginError));
      } finally {
        setPendingAction((current) => current === "instagram:begin" ? null : current);
        beginPromise.current = null;
      }
    })();
    beginPromise.current = run;
    return run;
  }, [canManage, clearInstagramAuthorization, currentWorkspaceId, instagramEnabled]);

  const consumeInstagramCallback = useCallback(async (input: { workspaceId: string; authorizationSessionId: string }) => {
    if (assetLoadPromise.current) return assetLoadPromise.current;
    if (!instagramEnabled) {
      setInstagramAuthorization({
        workspaceId: currentWorkspaceId ?? input.workspaceId,
        authorizationSessionId: "",
        assets: [],
        status: "error",
        error: safeSalesOperatorErrorCode("SALES_OPERATOR_FEATURE_DISABLED"),
      });
      return;
    }
    if (!currentWorkspaceId || input.workspaceId !== currentWorkspaceId) {
      setInstagramAuthorization({
        workspaceId: currentWorkspaceId ?? input.workspaceId,
        authorizationSessionId: "",
        assets: [],
        status: "error",
        error: {
          code: "WORKSPACE_MISMATCH",
          message: "This Instagram authorization was started in a different workspace.",
          remediation: "Switch back to the original workspace or start a new connection here.",
          retryable: true,
          requestId: null,
        },
      });
      return;
    }
    const workspaceId = currentWorkspaceId;
    const controller = new AbortController();
    const run = (async () => {
      setInstagramAuthorization({
        workspaceId,
        authorizationSessionId: input.authorizationSessionId,
        assets: [],
        status: "loading",
        error: null,
      });
      try {
        const response = await salesOperatorApi.listInstagramAssets(workspaceId, input.authorizationSessionId, controller.signal);
        if (currentWorkspaceIdRef.current !== workspaceId || !instagramEnabledRef.current) return;
        setInstagramAuthorization({
          workspaceId,
          authorizationSessionId: input.authorizationSessionId,
          assets: sanitizeInstagramAssets(response.assets),
          status: "ready",
          error: null,
        });
      } catch (assetError) {
        if (controller.signal.aborted || currentWorkspaceIdRef.current !== workspaceId || !instagramEnabledRef.current) return;
        setInstagramAuthorization({
          workspaceId,
          authorizationSessionId: input.authorizationSessionId,
          assets: [],
          status: "error",
          error: safeSalesOperatorError(assetError),
        });
      } finally {
        assetLoadPromise.current = null;
      }
    })();
    assetLoadPromise.current = run;
    return run;
  }, [currentWorkspaceId, instagramEnabled]);

  const confirmInstagramAssets = useCallback(async (externalAccountIds: string[]) => {
    if (confirmPromise.current) return confirmPromise.current;
    const authorization = instagramAuthorization;
    const workspaceId = currentWorkspaceId;
    if (
      !authorization ||
      !workspaceId ||
      !canManage ||
      !instagramEnabled ||
      authorization.workspaceId !== workspaceId ||
      authorization.status !== "ready" ||
      externalAccountIds.length === 0
    ) return false;
    const eligibleIds = new Set(authorization.assets.map((asset) => asset.externalAccountId));
    const selectedIds = [...new Set(externalAccountIds)].filter((id) => eligibleIds.has(id));
    if (selectedIds.length !== new Set(externalAccountIds).size) return false;

    const run = (async () => {
      setPendingAction("instagram:confirm");
      setError(null);
      try {
        await salesOperatorApi.confirmInstagramAssets(workspaceId, authorization.authorizationSessionId, selectedIds);
        if (currentWorkspaceIdRef.current !== workspaceId || !instagramEnabledRef.current) return false;
        clearInstagramAuthorization();
        await Promise.all([refreshChannels(), refreshDependents(workspaceId)]);
        return true;
      } catch (confirmError) {
        if (currentWorkspaceIdRef.current === workspaceId && instagramEnabledRef.current) {
          setInstagramAuthorization((current) => current ? { ...current, error: safeSalesOperatorError(confirmError) } : current);
        }
        return false;
      } finally {
        setPendingAction((current) => current === "instagram:confirm" ? null : current);
        confirmPromise.current = null;
      }
    })();
    confirmPromise.current = run;
    return run;
  }, [canManage, clearInstagramAuthorization, currentWorkspaceId, instagramAuthorization, instagramEnabled, refreshChannels, refreshDependents]);

  const runConnectionAction = useCallback(async (
    connectionId: string,
    action: ChannelAction,
    mutation: (workspaceId: string, connectionId: string) => Promise<unknown>,
  ) => {
    const workspaceId = currentWorkspaceId;
    const visibleConnections = connectionsWorkspaceId === workspaceId ? connections : [];
    const targetConnection = visibleConnections.find((connection) => connection.id === connectionId);
    if (
      !workspaceId
      || !canManage
      || !targetConnection
      || !isKnownConnection(visibleConnections, connectionId)
      || (targetConnection.provider === "instagram" && !instagramEnabled)
      || pendingAction
      || activeConnectionAction.current
    ) return;
    const actionKey = `${connectionId}:${action}`;
    const existing = connectionActionPromises.current.get(actionKey);
    if (existing) return existing;
    const run = (async () => {
      activeConnectionAction.current = actionKey;
      setPendingAction(actionKey);
      setError(null);
      setConnectionActionError(null);
      try {
        await mutation(workspaceId, connectionId);
        if (currentWorkspaceIdRef.current !== workspaceId) return;
        await Promise.all([refreshChannels(), refreshDependents(workspaceId)]);
      } catch (actionError) {
        if (currentWorkspaceIdRef.current === workspaceId) {
          const safeError = safeSalesOperatorError(actionError);
          setError(safeError);
          setConnectionActionError({ connectionId, error: safeError });
        }
        throw actionError;
      } finally {
        connectionActionPromises.current.delete(actionKey);
        if (activeConnectionAction.current === actionKey) activeConnectionAction.current = null;
        setPendingAction((current) => current === actionKey ? null : current);
      }
    })();
    connectionActionPromises.current.set(actionKey, run);
    return run;
  }, [canManage, connections, connectionsWorkspaceId, currentWorkspaceId, instagramEnabled, pendingAction, refreshChannels, refreshDependents]);

  const visibleConnections = connectionsWorkspaceId === currentWorkspaceId ? connections : [];
  const visibleInstagramAuthorization = instagramAuthorization?.workspaceId === currentWorkspaceId
    ? instagramAuthorization
    : null;

  const value = useMemo<SalesOperatorChannelsContextValue>(() => ({
    status,
    connections: visibleConnections,
    error,
    connectionActionError,
    canManage,
    instagramEnabled,
    pendingAction,
    instagramAuthorization: visibleInstagramAuthorization,
    refreshChannels,
    beginInstagramConnection,
    consumeInstagramCallback,
    clearInstagramAuthorization,
    confirmInstagramAssets,
    testConnection: (connectionId) => runConnectionAction(connectionId, "test", salesOperatorApi.testChannelConnection),
    refreshAuthorization: (connectionId) => runConnectionAction(connectionId, "refresh", salesOperatorApi.refreshChannelAuthorization),
    pauseConnection: (connectionId) => runConnectionAction(connectionId, "pause", salesOperatorApi.pauseChannel),
    resumeConnection: (connectionId) => runConnectionAction(connectionId, "resume", salesOperatorApi.resumeChannel),
    setAutomatedReplies: (connectionId, enabled) => runConnectionAction(
      connectionId,
      "automation",
      (workspaceId, id) => salesOperatorApi.updateChannelSettings(workspaceId, id, enabled),
    ),
    disconnectConnection: (connectionId) => runConnectionAction(connectionId, "disconnect", salesOperatorApi.disconnectChannel),
  }), [
    beginInstagramConnection,
    canManage,
    clearInstagramAuthorization,
    confirmInstagramAssets,
    visibleConnections,
    consumeInstagramCallback,
    error,
    connectionActionError,
    instagramEnabled,
    visibleInstagramAuthorization,
    pendingAction,
    refreshChannels,
    runConnectionAction,
    status,
  ]);

  return <SalesOperatorChannelsContext.Provider value={value}>{children}</SalesOperatorChannelsContext.Provider>;
}

export function useSalesOperatorChannels() {
  const context = useContext(SalesOperatorChannelsContext);
  if (!context) throw new Error("useSalesOperatorChannels must be used within SalesOperatorChannelsProvider.");
  return context;
}
