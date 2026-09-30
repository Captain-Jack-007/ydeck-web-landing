"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Info, Laptop, Plug, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { AgentCard } from "@/components/console/AgentCard";
import { MetricCard } from "@/components/console/MetricCard";
import { PageHeader, SectionHeader } from "@/components/console/PageHeader";
import { EmptyState } from "@/components/account/ui";
import { AGENTS, resolveAgentStatus } from "@/src/lib/agents";
import { getDesktopConnectionSummary } from "@/src/lib/desktop-portal";
import { resolveAttentionItems } from "@/src/lib/workspace-attention";
import { useAuth } from "@/src/providers/auth-provider";
import { useBilling } from "@/src/providers/billing-provider";
import { useDevices } from "@/src/providers/device-provider";
import { useSalesOperatorChannels } from "@/src/providers/sales-operator-channels-provider";
import { useWorkspace } from "@/src/providers/workspace-provider";

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatMetricName(metric: string) {
  return metric.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

export function WorkspaceDashboard() {
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const { summary, status: billingStatus } = useBilling();
  const { devices, status: devicesStatus } = useDevices();
  const {
    connections,
    status: channelsStatus,
    error: channelsError,
    instagramEnabled,
  } = useSalesOperatorChannels();

  // Resolved after mount so the greeting never disagrees with prerendered HTML.
  const [greeting, setGreeting] = useState("Welcome back");
  useEffect(() => {
    setGreeting(greetingFor(new Date().getHours()));
  }, []);

  const desktop = getDesktopConnectionSummary(devices, devicesStatus);
  const agentContext = { channels: connections, channelsStatus, desktop };
  const installedAgents = AGENTS.filter((agent) => agent.availability === "available");

  const attention = resolveAttentionItems({
    channels: connections,
    channelsStatus,
    channelsError,
    desktop,
    instagramEnabled,
    now: Date.now(),
  });

  const channelsLoading = channelsStatus === "loading" || channelsStatus === "idle";
  const connectedChannels = connections.filter((channel) => channel.status === "connected").length;
  const firstName = user?.displayName?.trim().split(/\s+/)[0] ?? null;
  const usage = summary?.usage ?? [];

  return (
    <>
      <PageHeader
        title={firstName ? `${greeting}, ${firstName}` : greeting}
        description={
          workspace?.name
            ? `Here's what's happening in ${workspace.name}.`
            : "Here's what's happening in your workspace."
        }
        actions={
          <>
            <Link className="account-button account-button--primary" href="/sales-operator/channels">
              <Plug aria-hidden size={15} /> Connect a channel
            </Link>
            <Link className="account-button account-button--secondary" href="/settings/devices">
              <Laptop aria-hidden size={15} /> Pair Desktop
            </Link>
            <Link className="account-button account-button--secondary" href="/agents">
              <Sparkles aria-hidden size={15} /> Browse agents
            </Link>
          </>
        }
      />

      <section className="console-section" aria-labelledby="workspace-overview">
        <h2 className="sr-only" id="workspace-overview">Workspace overview</h2>
        <div className="metric-grid">
          <MetricCard
            label="Connected channels"
            value={connectedChannels}
            hint={connectedChannels === 0 ? "None connected yet" : undefined}
            href="/integrations"
            loading={channelsLoading}
          />
          <MetricCard
            label="Desktop devices"
            value={desktop.activeCount}
            hint={desktop.activeCount === 0 ? "No device paired" : undefined}
            href="/settings/devices"
            loading={desktop.state === "loading"}
          />
          <MetricCard
            label="Agents in workspace"
            value={installedAgents.length}
            hint="More coming soon"
            href="/agents"
          />
          <MetricCard
            label="Needs attention"
            value={attention.length}
            hint={attention.length === 0 ? "Nothing right now" : undefined}
            loading={channelsLoading}
          />
        </div>
      </section>

      {attention.length > 0 ? (
        <section className="console-section" aria-labelledby="workspace-attention">
          <SectionHeader title={<span id="workspace-attention">Needs attention</span>} />
          <ul className="attention-list">
            {attention.map((item) => (
              <li key={item.id} className={`attention-row attention-row--${item.tone}`}>
                <span className="attention-row__icon" aria-hidden>
                  {item.tone === "warning" ? <AlertTriangle size={17} /> : <Info size={17} />}
                </span>
                <span className="attention-row__body">
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
                <Link className="console-link" href={item.href}>
                  {item.actionLabel} <ArrowRight aria-hidden size={14} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="console-section" aria-labelledby="workspace-agents">
        <SectionHeader
          title={<span id="workspace-agents">Your agents</span>}
          action={
            <Link className="console-link" href="/agents">
              All agents <ArrowRight aria-hidden size={14} />
            </Link>
          }
        />
        <div className="agent-grid">
          {installedAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} status={resolveAgentStatus(agent, agentContext)} />
          ))}
        </div>
      </section>

      <div className="workspace-dashboard__split">
        <section className="console-section" aria-labelledby="workspace-activity">
          <SectionHeader title={<span id="workspace-activity">Recent activity</span>} />
          {/* No activity endpoint exists yet. An honest empty state is correct
              here; inventing runs or message counts is not. */}
          <EmptyState title="No activity yet">
            Once your agents start handling work, a record of what they did will appear here.
          </EmptyState>
        </section>

        <section className="console-section" aria-labelledby="workspace-usage">
          <SectionHeader title={<span id="workspace-usage">Plan and usage</span>} />
          <div className="usage-panel">
            <div className="usage-panel__plan">
              <span>Current plan</span>
              <strong>
                {summary?.subscription.planName
                  ?? summary?.subscription.planKey
                  ?? (billingStatus === "loading" ? "Loading" : "Unavailable")}
              </strong>
            </div>
            {usage.length > 0 ? (
              <ul className="usage-panel__list">
                {usage.map((item) => (
                  <li key={item.metric}>
                    <span>{formatMetricName(item.metric)}</span>
                    <strong>
                      {item.used}
                      {typeof item.limit === "number" ? ` / ${item.limit}` : ""}
                    </strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="usage-panel__note">
                {billingStatus === "loading"
                  ? "Loading usage…"
                  : "No usage recorded for this billing period."}
              </p>
            )}
            <Link className="console-link" href="/settings/billing">
              Billing details <ArrowRight aria-hidden size={14} />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
