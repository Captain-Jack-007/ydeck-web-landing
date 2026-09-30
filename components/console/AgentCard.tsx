import Link from "next/link";
import { ArrowRight, Bot, CircleDashed, Laptop, LineChart, Building2, Wallet, Settings2 } from "lucide-react";
import type { AgentDefinition, AgentStatus } from "@/src/lib/agents";

const ICONS: Record<string, typeof Bot> = {
  "sales-operator": Bot,
  desktop: Laptop,
  report: LineChart,
  "company-intelligence": Building2,
  finance: Wallet,
  operations: Settings2,
};

/**
 * One agent, rendered the same way everywhere. Status is passed in rather than
 * derived here so the card stays presentational and future agents reuse it
 * without touching this file.
 *
 * Status is communicated by badge text as well as colour, so it survives
 * greyscale and colour-blind viewing.
 */
export function AgentCard({ agent, status }: { agent: AgentDefinition; status: AgentStatus }) {
  const Icon = ICONS[agent.id] ?? CircleDashed;
  const unavailable = agent.availability === "coming_soon" || !agent.href;

  const body = (
    <>
      <span className="agent-card__icon" aria-hidden>
        <Icon size={19} />
      </span>
      <span className="agent-card__body">
        <span className="agent-card__title">
          <strong>{agent.name}</strong>
          <span className={`agent-card__status agent-card__status--${status.tone}`}>{status.label}</span>
        </span>
        <span className="agent-card__description">{agent.description}</span>
        {status.detail ? <span className="agent-card__meta">{status.detail}</span> : null}
      </span>
      {unavailable ? null : (
        <span className="agent-card__action" aria-hidden>
          <ArrowRight size={16} />
        </span>
      )}
    </>
  );

  if (unavailable) {
    return (
      <article className="agent-card agent-card--unavailable" aria-label={`${agent.name} — ${status.label}`}>
        {body}
      </article>
    );
  }

  return (
    <Link className="agent-card" href={agent.href!} aria-label={`${agent.name} — ${status.label}`}>
      {body}
    </Link>
  );
}
