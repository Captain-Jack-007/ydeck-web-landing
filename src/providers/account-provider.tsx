"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as accountApi from "@/src/api/account";
import { getHumanErrorMessage, YDeckApiError } from "@/src/api/client";
import type { AccountSecuritySummary, AccountSession, SafeUserProfile } from "@/src/api/types";
import { useAuth } from "@/src/providers/auth-provider";

type LoadStatus = "idle" | "loading" | "ready" | "error";

export type AccountLoadErrorDetails = {
  category: "network" | "authentication" | "forbidden" | "server" | "unknown";
  requestId: string | null;
  timestamp: string;
};

type AccountContextValue = {
  status: LoadStatus;
  profileStatus: LoadStatus;
  securityStatus: LoadStatus;
  sessionsStatus: LoadStatus;
  profile: SafeUserProfile | null;
  security: AccountSecuritySummary | null;
  sessions: AccountSession[];
  error: string | null;
  profileError: string | null;
  securityError: string | null;
  sessionsError: string | null;
  errorDetails: AccountLoadErrorDetails | null;
  refreshAccount: () => Promise<void>;
  saveProfile: (patch: accountApi.ProfilePatch) => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeOtherSessions: () => Promise<void>;
};

const AccountContext = createContext<AccountContextValue | null>(null);

function accountErrorDetails(error: unknown): AccountLoadErrorDetails {
  return {
    category:
      error instanceof YDeckApiError
        ? error.status === 401
          ? "authentication"
          : error.status === 403
            ? "forbidden"
            : error.status >= 500
              ? "server"
              : "unknown"
        : error instanceof TypeError
          ? "network"
          : "unknown",
    requestId: error instanceof YDeckApiError ? error.requestId ?? null : null,
    timestamp: new Date().toISOString(),
  };
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const { status: authStatus, sessionVersion } = useAuth();
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [profileStatus, setProfileStatus] = useState<LoadStatus>("idle");
  const [securityStatus, setSecurityStatus] = useState<LoadStatus>("idle");
  const [sessionsStatus, setSessionsStatus] = useState<LoadStatus>("idle");
  const [profile, setProfile] = useState<SafeUserProfile | null>(null);
  const [security, setSecurity] = useState<AccountSecuritySummary | null>(null);
  const [sessions, setSessions] = useState<AccountSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<AccountLoadErrorDetails | null>(null);

  const refreshAccount = useCallback(async () => {
    if (authStatus !== "authenticated") {
      setProfile(null);
      setSecurity(null);
      setSessions([]);
      setStatus("idle");
      setProfileStatus("idle");
      setSecurityStatus("idle");
      setSessionsStatus("idle");
      setProfileError(null);
      setSecurityError(null);
      setSessionsError(null);
      setErrorDetails(null);
      return;
    }
    setStatus("loading");
    setProfileStatus("loading");
    setSecurityStatus("loading");
    setSessionsStatus("loading");
    setError(null);
    setProfileError(null);
    setSecurityError(null);
    setSessionsError(null);
    setErrorDetails(null);
    const results = await Promise.allSettled([
      accountApi.getProfile(),
      accountApi.getSecuritySummary(),
      accountApi.getAccountSessions(),
    ] as const);
    const [profileResult, securityResult, sessionsResult] = results;
    const failures: unknown[] = [];

    if (profileResult.status === "fulfilled") {
      setProfile(profileResult.value);
      setProfileStatus("ready");
    } else {
      failures.push(profileResult.reason);
      setProfileError(getHumanErrorMessage(profileResult.reason));
      setProfileStatus("error");
    }
    if (securityResult.status === "fulfilled") {
      setSecurity(securityResult.value);
      setSecurityStatus("ready");
    } else {
      failures.push(securityResult.reason);
      setSecurityError(getHumanErrorMessage(securityResult.reason));
      setSecurityStatus("error");
    }
    if (sessionsResult.status === "fulfilled") {
      setSessions(sessionsResult.value);
      setSessionsStatus("ready");
    } else {
      failures.push(sessionsResult.reason);
      setSessionsError(getHumanErrorMessage(sessionsResult.reason));
      setSessionsStatus("error");
    }

    if (failures.length > 0) {
      setError(getHumanErrorMessage(failures[0]));
      setErrorDetails(accountErrorDetails(failures[0]));
    }
    setStatus(failures.length === results.length ? "error" : "ready");
  }, [authStatus, sessionVersion]);

  useEffect(() => {
    void refreshAccount();
  }, [refreshAccount]);

  const saveProfile = useCallback(async (patch: accountApi.ProfilePatch) => {
    const nextProfile = await accountApi.updateProfile(patch);
    setProfile(nextProfile);
  }, []);

  const revokeSession = useCallback(async (sessionId: string) => {
    setSessionsStatus("loading");
    setSessionsError(null);
    try {
      await accountApi.revokeAccountSession(sessionId);
      const nextSessions = await accountApi.getAccountSessions();
      setSessions(nextSessions);
      setSessionsStatus("ready");
    } catch (revokeError) {
      setSessionsError(getHumanErrorMessage(revokeError));
      setSessionsStatus("error");
      throw revokeError;
    }
  }, []);

  const revokeOtherSessions = useCallback(async () => {
    setSessionsStatus("loading");
    setSessionsError(null);
    try {
      await accountApi.revokeOtherSessions();
      const nextSessions = await accountApi.getAccountSessions();
      setSessions(nextSessions);
      setSessionsStatus("ready");
    } catch (revokeError) {
      setSessionsError(getHumanErrorMessage(revokeError));
      setSessionsStatus("error");
      throw revokeError;
    }
  }, []);

  const value = useMemo<AccountContextValue>(
    () => ({
      status,
      profileStatus,
      securityStatus,
      sessionsStatus,
      profile,
      security,
      sessions,
      error,
      profileError,
      securityError,
      sessionsError,
      errorDetails,
      refreshAccount,
      saveProfile,
      revokeSession,
      revokeOtherSessions,
    }),
    [
      error,
      errorDetails,
      profile,
      profileError,
      profileStatus,
      refreshAccount,
      revokeOtherSessions,
      revokeSession,
      saveProfile,
      security,
      securityError,
      securityStatus,
      sessions,
      sessionsError,
      sessionsStatus,
      status,
    ],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within AccountProvider.");
  }
  return context;
}
