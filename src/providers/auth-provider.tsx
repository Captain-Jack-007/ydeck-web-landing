"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  clearApiAccessToken,
  getApiAccessToken,
  getHumanErrorMessage,
  hasWebRefreshSessionHint,
  setAccessTokenRefreshedHandler,
  setApiAccessToken,
  setUnauthorizedHandler,
} from "@/src/api/client";
import * as authApi from "@/src/api/auth";
import type { CurrentUser } from "@/src/api/types";
import { broadcastAuthInvalidation, subscribeAuthInvalidation } from "@/src/lib/auth-channel";
import { authReturnToParam } from "@/src/lib/auth-return";
import { captureInstagramCompletionContext } from "@/src/lib/instagram-oauth-completion";

export type AuthSessionStatus = "loading" | "authenticated" | "unauthenticated" | "error";

type AuthContextValue = {
  status: AuthSessionStatus;
  user: CurrentUser | null;
  error: string | null;
  sessionVersion: number;
  refreshSession: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: (returnTo?: string) => Promise<void>;
  signOutEverywhere: () => Promise<void>;
  clearSessionState: () => void;
  setAuthenticatedUser: (user: CurrentUser, accessToken: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
let bootstrapSessionPromise: Promise<CurrentUser | null> | null = null;
let bootstrapSessionAttemptedWithoutToken = false;

function bootstrapWebSession() {
  if (getApiAccessToken()) {
    return authApi.getCurrentUser();
  }
  if (!hasWebRefreshSessionHint()) {
    return Promise.resolve(null);
  }
  if (bootstrapSessionAttemptedWithoutToken) {
    return Promise.resolve(null);
  }
  if (bootstrapSessionPromise) {
    return bootstrapSessionPromise;
  }

  bootstrapSessionAttemptedWithoutToken = true;
  bootstrapSessionPromise = authApi.restoreWebSession().finally(() => {
    bootstrapSessionPromise = null;
  });
  return bootstrapSessionPromise;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthSessionStatus>("loading");
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionVersion, setSessionVersion] = useState(0);

  const clearSession = useCallback(() => {
    clearApiAccessToken();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const loadSession = useCallback(async (restore: () => Promise<CurrentUser | null>) => {
    setStatus("loading");
    setError(null);
    try {
      const restored = await restore();
      if (!restored) {
        clearSession();
        return;
      }
      setUser(restored);
      setStatus("authenticated");
      setSessionVersion((value) => value + 1);
    } catch (refreshError) {
      setError(getHumanErrorMessage(refreshError));
      clearSession();
    }
  }, [clearSession]);

  const refreshSession = useCallback(async () => {
    bootstrapSessionAttemptedWithoutToken = false;
    await loadSession(bootstrapWebSession);
  }, [loadSession]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearApiAccessToken();
      setUser(null);
      setStatus("unauthenticated");
      broadcastAuthInvalidation("session_revoked");
    });
    setAccessTokenRefreshedHandler(() => {
      setSessionVersion((value) => value + 1);
      void authApi.getCurrentUser({ retryOnAuth: false }).then((nextUser) => {
        setUser(nextUser);
        setStatus("authenticated");
      }).catch((refreshError) => {
        setError(getHumanErrorMessage(refreshError));
      });
    });
    const unsubscribe = subscribeAuthInvalidation(() => {
      clearSession();
      router.replace("/auth/sign-in");
    });
    void loadSession(bootstrapWebSession);
    return () => {
      setUnauthorizedHandler(null);
      setAccessTokenRefreshedHandler(null);
      unsubscribe();
    };
  }, [clearSession, loadSession, router]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    setError(null);
    const response = await authApi.loginWithPassword({ email, password });
    setApiAccessToken(response.accessToken);
    setUser(response.user);
    setStatus("authenticated");
    setSessionVersion((value) => value + 1);
  }, []);

  const signOut = useCallback(async (returnTo = "/") => {
    await authApi.logout();
    clearSession();
    router.push(`/auth/sign-in${authReturnToParam(returnTo)}`);
  }, [clearSession, router]);

  const signOutEverywhere = useCallback(async () => {
    await authApi.logoutAll();
    clearSession();
    router.push("/auth/sign-in");
  }, [clearSession, router]);

  const setAuthenticatedUser = useCallback((nextUser: CurrentUser, accessToken: string) => {
    setApiAccessToken(accessToken);
    setError(null);
    setUser(nextUser);
    setStatus("authenticated");
    setSessionVersion((value) => value + 1);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      error,
      sessionVersion,
      refreshSession,
      signInWithPassword,
      signOut,
      signOutEverywhere,
      clearSessionState: clearSession,
      setAuthenticatedUser,
    }),
    [clearSession, error, refreshSession, sessionVersion, setAuthenticatedUser, signInWithPassword, signOut, signOutEverywhere, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}

export function RequireAuth({
  children,
  preserveSearchParams = true,
  preserveInstagramCompletionContext = false,
}: {
  children: ReactNode;
  preserveSearchParams?: boolean;
  preserveInstagramCompletionContext?: boolean;
}) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === "unauthenticated") {
      if (preserveInstagramCompletionContext) {
        captureInstagramCompletionContext(new URLSearchParams(searchParams.toString()));
      }
      const query = preserveSearchParams ? searchParams.toString() : "";
      router.replace(`/auth/sign-in${authReturnToParam(`${pathname}${query ? `?${query}` : ""}`)}`);
    }
  }, [pathname, preserveInstagramCompletionContext, preserveSearchParams, router, searchParams, status]);

  if (status === "loading") {
    return (
      <div className="account-page account-page--center">
        <div className="account-skeleton-card" aria-label="Loading account" />
      </div>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  return <>{children}</>;
}
