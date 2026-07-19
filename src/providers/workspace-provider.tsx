"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as workspaceApi from "@/src/api/workspace";
import { getHumanErrorMessage, YDeckApiError } from "@/src/api/client";
import type { Workspace, WorkspaceCurrentResponse, WorkspaceMembership, WorkspacePermission } from "@/src/api/types";
import { isWorkspaceCurrentResponse, mergeAuthoritativeWorkspace } from "@/src/lib/workspace-state";
import { useAuth } from "@/src/providers/auth-provider";

type WorkspaceStatus = "idle" | "loading" | "ready" | "error";

type WorkspaceContextValue = {
  status: WorkspaceStatus;
  workspaces: Workspace[];
  workspace: Workspace | null;
  membership: WorkspaceMembership | null;
  permissions: WorkspacePermission[];
  error: string | null;
  cacheVersion: number;
  refreshWorkspace: () => Promise<void>;
  selectWorkspace: (workspaceId: string) => Promise<void>;
  createWorkspace: (input: { name: string; slug?: string }) => Promise<void>;
  hasPermission: (permission: string) => boolean;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

class InvalidWorkspaceContextError extends Error {
  constructor() {
    super("The server did not return a valid current workspace.");
    this.name = "InvalidWorkspaceContextError";
  }
}

function shouldRetryWorkspaceResolution(error: unknown) {
  return (
    error instanceof InvalidWorkspaceContextError ||
    error instanceof TypeError ||
    (error instanceof YDeckApiError && (error.retryable === true || error.status >= 500))
  );
}

function workspaceErrorMessage(error: unknown) {
  const message = getHumanErrorMessage(error);
  if (!(error instanceof YDeckApiError) || !error.requestId || message.includes(error.requestId)) {
    return message;
  }
  return `${message} Request ID: ${error.requestId}.`;
}

async function getAuthoritativeCurrentWorkspace() {
  let lastError: unknown = new InvalidWorkspaceContextError();
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response: unknown = await workspaceApi.getCurrentWorkspace();
      if (isWorkspaceCurrentResponse(response)) {
        return response;
      }
      lastError = new InvalidWorkspaceContextError();
    } catch (error) {
      lastError = error;
    }
    if (attempt === 0 && shouldRetryWorkspaceResolution(lastError)) {
      continue;
    }
    throw lastError;
  }
  throw lastError;
}

async function loadServerWorkspaceState(currentOverride?: WorkspaceCurrentResponse) {
  const nextCurrent = currentOverride ?? await getAuthoritativeCurrentWorkspace();
  let listError: unknown = null;
  let list: Workspace[] = [];
  try {
    list = await workspaceApi.listWorkspaces();
    if (!list.some((workspace) => workspace.id === nextCurrent.workspace.id)) {
      list = await workspaceApi.listWorkspaces();
    }
  } catch (error) {
    listError = error;
  }
  return {
    current: nextCurrent,
    workspaces: mergeAuthoritativeWorkspace(nextCurrent, list),
    listError,
  };
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { status: authStatus, sessionVersion, user } = useAuth();
  const [status, setStatus] = useState<WorkspaceStatus>("idle");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [current, setCurrent] = useState<WorkspaceCurrentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cacheVersion, setCacheVersion] = useState(0);
  const workspaceRequestId = useRef(0);

  const applyCurrent = useCallback((nextCurrent: WorkspaceCurrentResponse, list: Workspace[]) => {
    setCurrent(nextCurrent);
    setWorkspaces(mergeAuthoritativeWorkspace(nextCurrent, list));
  }, []);

  const refreshWorkspace = useCallback(async () => {
    const requestId = ++workspaceRequestId.current;
    if (authStatus !== "authenticated") {
      setWorkspaces([]);
      setCurrent(null);
      setStatus("idle");
      setError(null);
      return;
    }
    setCurrent(null);
    setWorkspaces([]);
    setStatus("loading");
    setError(null);
    setCacheVersion((value) => value + 1);
    try {
      const nextState = await loadServerWorkspaceState();
      if (workspaceRequestId.current !== requestId) {
        return;
      }
      applyCurrent(nextState.current, nextState.workspaces);
      setError(nextState.listError ? workspaceErrorMessage(nextState.listError) : null);
      setStatus("ready");
    } catch (loadError) {
      if (workspaceRequestId.current !== requestId) {
        return;
      }
      setCurrent(null);
      setWorkspaces([]);
      setError(workspaceErrorMessage(loadError));
      setStatus("error");
    }
  }, [applyCurrent, authStatus, sessionVersion, user?.id]);

  useEffect(() => {
    void refreshWorkspace();
  }, [refreshWorkspace]);

  const selectWorkspace = useCallback(
    async (workspaceId: string) => {
      const requestId = ++workspaceRequestId.current;
      setCurrent(null);
      setStatus("loading");
      setError(null);
      setCacheVersion((value) => value + 1);
      try {
        const nextCurrent = await workspaceApi.selectWorkspace(workspaceId);
        if (!isWorkspaceCurrentResponse(nextCurrent)) {
          throw new InvalidWorkspaceContextError();
        }
        const nextState = await loadServerWorkspaceState(nextCurrent);
        if (workspaceRequestId.current !== requestId) {
          return;
        }
        applyCurrent(nextState.current, nextState.workspaces);
        setError(nextState.listError ? workspaceErrorMessage(nextState.listError) : null);
        setStatus("ready");
      } catch (selectError) {
        if (workspaceRequestId.current !== requestId) {
          return;
        }
        setWorkspaces([]);
        setError(workspaceErrorMessage(selectError));
        try {
          const restoredState = await loadServerWorkspaceState();
          if (workspaceRequestId.current !== requestId) {
            return;
          }
          applyCurrent(restoredState.current, restoredState.workspaces);
          setStatus("ready");
        } catch (restoreError) {
          if (workspaceRequestId.current !== requestId) {
            return;
          }
          setCurrent(null);
          setWorkspaces([]);
          setError(workspaceErrorMessage(restoreError));
          setStatus("error");
        }
      }
    },
    [applyCurrent],
  );

  const createWorkspace = useCallback(
    async (input: { name: string; slug?: string }) => {
      const requestId = ++workspaceRequestId.current;
      setCurrent(null);
      setWorkspaces([]);
      setStatus("loading");
      setError(null);
      setCacheVersion((value) => value + 1);
      try {
        const created = await workspaceApi.createWorkspace(input);
        const nextCurrent = await workspaceApi.selectWorkspace(created.id);
        if (!isWorkspaceCurrentResponse(nextCurrent)) {
          throw new InvalidWorkspaceContextError();
        }
        const nextState = await loadServerWorkspaceState(nextCurrent);
        if (workspaceRequestId.current !== requestId) {
          return;
        }
        applyCurrent(nextState.current, nextState.workspaces);
        setError(nextState.listError ? workspaceErrorMessage(nextState.listError) : null);
        setStatus("ready");
      } catch (createError) {
        if (workspaceRequestId.current === requestId) {
          setError(workspaceErrorMessage(createError));
          try {
            const restoredState = await loadServerWorkspaceState();
            if (workspaceRequestId.current === requestId) {
              applyCurrent(restoredState.current, restoredState.workspaces);
              setStatus("ready");
            }
          } catch (restoreError) {
            if (workspaceRequestId.current === requestId) {
              setCurrent(null);
              setWorkspaces([]);
              setError(workspaceErrorMessage(restoreError));
              setStatus("error");
            }
          }
        }
        throw createError;
      }
    },
    [applyCurrent],
  );

  const permissions = current?.permissions ?? [];
  const value = useMemo<WorkspaceContextValue>(
    () => ({
      status,
      workspaces,
      workspace: current?.workspace ?? null,
      membership: current?.membership ?? null,
      permissions,
      error,
      cacheVersion,
      refreshWorkspace,
      selectWorkspace,
      createWorkspace,
      hasPermission: (permission) => permissions.includes(permission),
    }),
    [cacheVersion, createWorkspace, current, error, permissions, refreshWorkspace, selectWorkspace, status, workspaces],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider.");
  }
  return context;
}
