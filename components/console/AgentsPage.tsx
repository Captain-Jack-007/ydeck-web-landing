"use client";

import { AgentCard } from "@/components/console/AgentCard";
import { PageHeader, SectionHeader } from "@/components/console/PageHeader";
import { AGENTS, resolveAgentStatus } from "@/src/lib/agents";
import { getDesktopConnectionSummary } from "@/src/lib/desktop-portal";
import { useDevices } from "@/src/providers/device-provider";
import { useSalesOperatorChannels } from "@/src/providers/sales-operator-channels-provider";

export function AgentsPage() {
  const { devices, status: devicesStatus } = useDevices();
  const { connections, status: channelsStatus } = useSalesOperatorChannels();

  const context = {
    channels: connections,
    channelsStatus,
    desktop: getDesktopConnectionSummary(devices, devicesStatus),
  };

  const installed = AGENTS.filter((agent) => agent.availability === "available");
  const upcoming = AGENTS.filter((agent) => agent.availability === "coming_soon");

  return (
    <>
      <PageHeader
        title="Agents"
        description="Agents run inside your workspace, using the channels and material you connect to them."
      />

      <section className="console-section" aria-labelledby="agents-installed">
        <SectionHeader title={<span id="agents-installed">In your workspace</span>} />
        <div className="agent-grid">
          {installed.map((agent) => (
            <AgentCard key={agent.id} agent={agent} status={resolveAgentStatus(agent, context)} />
          ))}
        </div>
      </section>

      <section className="console-section" aria-labelledby="agents-upcoming">
        <SectionHeader
          title={<span id="agents-upcoming">Planned</span>}
          description="Not available yet. These appear here when they are ready to use."
        />
        <div className="agent-grid">
          {upcoming.map((agent) => (
            <AgentCard key={agent.id} agent={agent} status={resolveAgentStatus(agent, context)} />
          ))}
        </div>
      </section>
    </>
  );
}
