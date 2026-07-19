"use client";

import type { ReactNode } from "react";
import { AccountProvider } from "@/src/providers/account-provider";
import { AuthProvider } from "@/src/providers/auth-provider";
import { BillingProvider } from "@/src/providers/billing-provider";
import { DeviceProvider } from "@/src/providers/device-provider";
import { WorkspaceProvider } from "@/src/providers/workspace-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AccountProvider>
        <WorkspaceProvider>
          <BillingProvider>
            <DeviceProvider>{children}</DeviceProvider>
          </BillingProvider>
        </WorkspaceProvider>
      </AccountProvider>
    </AuthProvider>
  );
}
