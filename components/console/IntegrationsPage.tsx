"use client";

import Link from "next/link";
import { ArrowRight, Camera, Laptop, MessagesSquare, Send } from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/console/PageHeader";
import { EmptyState, StatusBadge } from "@/components/account/ui";
import { getDesktopConnectionSummary } from "@/src/lib/desktop-portal";
import { useDevices } from "@/src/providers/device-provider";
import { useSalesOperatorChannels } from "@/src/providers/sales-operator-channels-provider";
import type { SalesChannelConnection } from "@/src/api/sales-operator";

const PROVIDER_META: Record<string, { label: string; icon: typeof Camera }> = {
  instagram: { label: "Instagram", icon: Camera },
  facebook: { label: "Facebook Messenger", icon: MessagesSquare },
  telegram: { label: "Telegram", icon: Send },
};

function channelTone(connection: SalesChannelConnection) {
  if (connection.safeErrorCode) return "warning";
  if (connection.status === "connected") return "paid";
  return "neutral";
}

function channelLabel(connection: SalesChannelConnection) {
  if (connection.safeErrorCode) return "Needs attention";
  if (connection.status === "connected") return "Connected";
  return connection.status.replaceAll("_", " ").replace(/^./, (c) => c.toUpperCase());
}

export function IntegrationsPage() {
  const { connections, status: channelsStatus } = useSalesOperatorChannels();
  const { devices, status: devicesStatus } = useDevices();
  const desktop = getDesktopConnectionSummary(devices, devicesStatus);

  return (
    <>
      <PageHeader
        title="Integrations"
        description="The external systems connected to this workspace."
      />

      <section className="console-section" aria-labelledby="integrations-channels">
        <SectionHeader
          title={<span id="integrations-channels">Customer channels</span>}
          description="Business messaging accounts that Sales Operator can use."
          action={
            <Link className="console-link" href="/sales-operator/channels">
              Manage channels <ArrowRight aria-hidden size={14} />
            </Link>
          }
        />

        {channelsStatus === "loading" || channelsStatus === "idle" ? (
          <div className="console-placeholder" aria-live="polite">Loading connected channels…</div>
        ) : connections.length === 0 ? (
          <EmptyState
            title="No channels connected yet"
            action={
              <Link className="account-button account-button--primary" href="/sales-operator/channels">
                Connect a channel
              </Link>
            }
          >
            Connect a business messaging account so Sales Operator can handle incoming customer conversations.
          </EmptyState>
        ) : (
          <ul className="integration-list">
            {connections.map((connection) => {
              const meta = PROVIDER_META[connection.provider] ?? { label: connection.provider, icon: MessagesSquare };
              const Icon = meta.icon;
              return (
                <li key={connection.id} className="integration-row">
                  <span className="integration-row__icon" aria-hidden><Icon size={17} /></span>
                  <span className="integration-row__body">
                    <strong>{connection.accountName || meta.label}</strong>
                    <small>{meta.label}{connection.linkedBusinessName ? ` · ${connection.linkedBusinessName}` : ""}</small>
                  </span>
                  <StatusBadge tone={channelTone(connection)}>{channelLabel(connection)}</StatusBadge>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="console-section" aria-labelledby="integrations-devices">
        <SectionHeader
          title={<span id="integrations-devices">Desktop devices</span>}
          description="Computers authorized to run YDeck Desktop with this account."
          action={
            <Link className="console-link" href="/settings/devices">
              Manage devices <ArrowRight aria-hidden size={14} />
            </Link>
          }
        />

        {desktop.state === "loading" ? (
          <div className="console-placeholder" aria-live="polite">Checking Desktop devices…</div>
        ) : desktop.activeCount === 0 ? (
          <EmptyState
            title="No Desktop device paired"
            action={
              <Link className="account-button account-button--primary" href="/settings/devices">
                Pair a device
              </Link>
            }
          >
            Pair a computer to use YDeck Desktop with this workspace.
          </EmptyState>
        ) : (
          <ul className="integration-list">
            <li className="integration-row">
              <span className="integration-row__icon" aria-hidden><Laptop size={17} /></span>
              <span className="integration-row__body">
                <strong>{desktop.title}</strong>
                <small>{desktop.detail}</small>
              </span>
              <StatusBadge tone={desktop.state === "attention" ? "warning" : "paid"}>
                {desktop.state === "attention" ? "Needs attention" : "Active"}
              </StatusBadge>
            </li>
          </ul>
        )}
      </section>
    </>
  );
}
