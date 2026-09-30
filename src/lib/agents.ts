import type { WorkspaceBillingSummary } from "@/src/api/types";
import type { SalesChannelConnection } from "@/src/api/sales-operator";
import type { DesktopConnectionSummary } from "@/src/lib/desktop-portal";

/**
 * The YDeck agent catalogue.
 *
 * One declaration per agent so Home, /agents and any future surface render the
 * same facts from the same place. Availability is deliberately NOT inferred
 * from entitlement flags alone: the API exposes flags (report_intelligence_*,
 * 1C, SAP) for capabilities that have no product surface yet, and PRODUCT.md
 * requires those to read as "Coming soon" rather than as usable agents.
 *
 * To add an agent: add an entry, give it `availability: "available"` only once
 * it has a real destination, and return live status from `resolveAgentStatus`.
 */

export type AgentAvailability = "available" | "coming_soon";

export type AgentStatusTone = "active" | "attention" | "setup" | "neutral";

export type AgentDefinition = {
  id: string;
  name: string;
  /** One line, concrete, no marketing claims. */
  description: string;
  availability: AgentAvailability;
  /** Only set for available agents. */
  href?: string;
  /** Label for the card's primary action. */
  actionLabel?: string;
};

export type AgentStatus = {
  tone: AgentStatusTone;
  /** Short status word shown in the badge. */
  label: string;
  /** Optional supporting metadata line. Omitted when nothing real is known. */
  detail?: string;
};

export const AGENTS: AgentDefinition[] = [
  {
    id: "sales-operator",
    name: "Sales Operator",
    description: "Handles incoming customer conversations on connected business channels, with your team in control.",
    availability: "available",
    href: "/sales-operator/channels",
    actionLabel: "Open agent",
  },
  {
    id: "desktop",
    name: "YDeck Desktop",
    description: "Turns documents, research, and workspace material into editable presentations on macOS and Windows.",
    availability: "available",
    href: "/desktop-portal",
    actionLabel: "Open Desktop",
  },
  {
    id: "report",
    name: "Report Agent",
    description: "Builds recurring business reports from your connected company data.",
    availability: "coming_soon",
  },
  {
    id: "company-intelligence",
    name: "Company Intelligence",
    description: "Answers questions about company operations using your workspace knowledge.",
    availability: "coming_soon",
  },
  {
    id: "finance",
    name: "Finance Agent",
    description: "Works with finance records and reconciles reporting across connected systems.",
    availability: "coming_soon",
  },
  {
    id: "operations",
    name: "Operations Agent",
    description: "Connects to 1C and SAP to support day-to-day operational workflows.",
    availability: "coming_soon",
  },
];

export function isChannelHealthy(connection: SalesChannelConnection) {
  return connection.status === "connected" && !connection.safeErrorCode;
}

export function countConnectedChannels(connections: SalesChannelConnection[]) {
  return connections.filter((connection) => connection.status === "connected").length;
}

/**
 * Live status for one agent, derived only from data the API really returns.
 * Anything unknown stays `neutral` with no invented detail line.
 */
export function resolveAgentStatus(
  agent: AgentDefinition,
  context: {
    channels: SalesChannelConnection[];
    channelsStatus: string;
    desktop: DesktopConnectionSummary;
  },
): AgentStatus {
  if (agent.availability === "coming_soon") {
    return { tone: "neutral", label: "Coming soon" };
  }

  if (agent.id === "sales-operator") {
    if (context.channelsStatus === "loading" || context.channelsStatus === "idle") {
      return { tone: "neutral", label: "Checking" };
    }
    if (context.channelsStatus === "error") {
      return { tone: "neutral", label: "Status unavailable" };
    }

    const connected = context.channels.filter((channel) => channel.status === "connected");
    if (connected.length === 0) {
      return { tone: "setup", label: "Needs setup", detail: "No customer channels connected yet" };
    }

    const unhealthy = connected.filter((channel) => Boolean(channel.safeErrorCode));
    if (unhealthy.length > 0) {
      return {
        tone: "attention",
        label: "Needs attention",
        detail: `${unhealthy.length} of ${connected.length} channels need a check`,
      };
    }

    const replying = connected.filter((channel) => channel.automatedRepliesEnabled).length;
    return {
      tone: "active",
      label: "Active",
      detail: replying > 0
        ? `${connected.length} ${connected.length === 1 ? "channel" : "channels"} · automated replies on for ${replying}`
        : `${connected.length} ${connected.length === 1 ? "channel" : "channels"} · automated replies off`,
    };
  }

  if (agent.id === "desktop") {
    const { state, activeCount } = context.desktop;
    if (state === "loading") {
      return { tone: "neutral", label: "Checking" };
    }
    if (state === "connected") {
      return {
        tone: "active",
        label: "Connected",
        detail: `${activeCount} ${activeCount === 1 ? "device" : "devices"} paired`,
      };
    }
    if (state === "attention") {
      return { tone: "attention", label: "Needs attention", detail: "A paired device needs review" };
    }
    if (state === "unavailable") {
      return { tone: "neutral", label: "Status unavailable" };
    }
    return { tone: "setup", label: "Not paired", detail: "No Desktop device paired yet" };
  }

  return { tone: "neutral", label: "Available" };
}

/** True when the workspace's plan actually grants the Sales Operator agent. */
export function hasSalesOperatorEntitlement(summary: WorkspaceBillingSummary | null) {
  const flags = summary?.entitlements?.booleans;
  if (!flags) {
    return true; // unknown entitlements must not hide a working product
  }
  return flags["sales_operator"] !== false;
}
