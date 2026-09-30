"use client";

import type { ReactNode } from "react";
import { AccountProvider } from "@/src/providers/account-provider";
import { AuthProvider } from "@/src/providers/auth-provider";
import { BillingProvider } from "@/src/providers/billing-provider";
import { DeviceProvider } from "@/src/providers/device-provider";
import { SalesOperatorChannelsProvider } from "@/src/providers/sales-operator-channels-provider";
import { WorkspaceProvider } from "@/src/providers/workspace-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AccountProvider>
        <WorkspaceProvider>
          <BillingProvider>
            <DeviceProvider>
              {/* Channels are workspace state, not a Sales Operator detail: the
                  workspace dashboard and Integrations both report on them. The
                  provider self-guards on auth + workspace, so it stays inert
                  for anonymous visitors on the public pages. */}
              <SalesOperatorChannelsProvider>{children}</SalesOperatorChannelsProvider>
            </DeviceProvider>
          </BillingProvider>
        </WorkspaceProvider>
      </AccountProvider>
    </AuthProvider>
  );
}
