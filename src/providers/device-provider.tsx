"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as deviceApi from "@/src/api/devices";
import { getHumanErrorMessage } from "@/src/api/client";
import type { AccountDesktopDevice } from "@/src/api/types";
import { isCompletePairingCode, mapPairingDecisionError, type PairingDecision } from "@/src/lib/desktop-pairing";
import { useAccount } from "@/src/providers/account-provider";
import { useAuth } from "@/src/providers/auth-provider";
import { useWorkspace } from "@/src/providers/workspace-provider";

type DeviceStatus = "idle" | "loading" | "ready" | "error";

type DeviceContextValue = {
  status: DeviceStatus;
  devices: AccountDesktopDevice[];
  error: string | null;
  pairingDecision: PairingDecision;
  refreshDevices: () => Promise<void>;
  approveCode: (code: string) => Promise<PairingDecision>;
  denyCode: (code: string) => Promise<PairingDecision>;
  resetPairingDecision: () => void;
  revokeDevice: (deviceId: string) => Promise<void>;
  revokeAll: (reason?: string) => Promise<{ revokedDevices: number; revokedSessions: number }>;
};

const DeviceContext = createContext<DeviceContextValue | null>(null);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const { status: authStatus, user } = useAuth();
  const { refreshAccount } = useAccount();
  const { refreshWorkspace } = useWorkspace();
  const [status, setStatus] = useState<DeviceStatus>("idle");
  const [devices, setDevices] = useState<AccountDesktopDevice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pairingDecision, setPairingDecision] = useState<PairingDecision>({ status: "idle" });
  const devicesRequestId = useRef(0);
  const accountId = user?.id ?? null;

  const refreshDevices = useCallback(async () => {
    const requestId = ++devicesRequestId.current;
    if (authStatus !== "authenticated" || !accountId) {
      setDevices([]);
      setStatus("idle");
      setError(null);
      return;
    }
    setDevices([]);
    setStatus("loading");
    setError(null);
    try {
      const nextDevices = await deviceApi.listDesktopDevices();
      if (devicesRequestId.current === requestId) {
        setDevices(nextDevices);
        setStatus("ready");
      }
    } catch (loadError) {
      if (devicesRequestId.current === requestId) {
        setDevices([]);
        setError(getHumanErrorMessage(loadError));
        setStatus("error");
      }
      throw loadError;
    }
  }, [accountId, authStatus]);

  useEffect(() => {
    setPairingDecision({ status: "idle" });
    void refreshDevices().catch(() => undefined);
  }, [accountId, refreshDevices]);

  const resetPairingDecision = useCallback(() => {
    setPairingDecision({ status: "idle" });
  }, []);

  const approveCode = useCallback(
    async (code: string) => {
      if (!isCompletePairingCode(code)) {
        const invalidDecision: PairingDecision = {
          status: "invalid_code",
          message: "Enter the complete pairing code shown in YDeck Desktop.",
          requestId: null,
        };
        setPairingDecision(invalidDecision);
        return invalidDecision;
      }
      resetPairingDecision();
      try {
        const response = await deviceApi.approvePairing(code);
        await Promise.allSettled([refreshAccount(), refreshWorkspace()]);
        const approvedDecision: PairingDecision = { status: "approved", response };
        setPairingDecision(approvedDecision);
        return approvedDecision;
      } catch (approvalError) {
        const failure = mapPairingDecisionError(approvalError);
        setPairingDecision(failure);
        return failure;
      }
    },
    [refreshAccount, refreshWorkspace, resetPairingDecision],
  );

  const denyCode = useCallback(async (code: string) => {
    if (!isCompletePairingCode(code)) {
      const invalidDecision: PairingDecision = {
        status: "invalid_code",
        message: "Enter the complete pairing code shown in YDeck Desktop.",
        requestId: null,
      };
      setPairingDecision(invalidDecision);
      return invalidDecision;
    }
    resetPairingDecision();
    try {
      await deviceApi.denyPairing(code);
      const deniedDecision: PairingDecision = { status: "denied" };
      setPairingDecision(deniedDecision);
      return deniedDecision;
    } catch (denialError) {
      const failure = mapPairingDecisionError(denialError);
      setPairingDecision(failure);
      return failure;
    }
  }, [resetPairingDecision]);

  const revokeDevice = useCallback(
    async (deviceId: string) => {
      await deviceApi.revokeDesktopDevice(deviceId);
      await Promise.allSettled([refreshDevices(), refreshAccount()]);
    },
    [refreshAccount, refreshDevices],
  );

  const revokeAll = useCallback(
    async (reason?: string) => {
      const result = await deviceApi.revokeAllDesktopDevices({ reason });
      await Promise.allSettled([refreshDevices(), refreshAccount()]);
      return result;
    },
    [refreshAccount, refreshDevices],
  );

  const value = useMemo<DeviceContextValue>(
    () => ({
      status,
      devices,
      error,
      pairingDecision,
      refreshDevices,
      approveCode,
      denyCode,
      resetPairingDecision,
      revokeDevice,
      revokeAll,
    }),
    [approveCode, denyCode, devices, error, pairingDecision, refreshDevices, resetPairingDecision, revokeAll, revokeDevice, status],
  );

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
}

export function useDevices() {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error("useDevices must be used within DeviceProvider.");
  }
  return context;
}
