"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Bot, Camera, ChevronRight, MessageCircle, MessagesSquare, Radio, Send } from "lucide-react";
import type { ReactNode } from "react";
import { ConsoleShell } from "@/components/console/ConsoleShell";
import {
  SALES_OPERATOR_DISPLAY_NAME,
  SALES_OPERATOR_PACKAGE_ID,
  SALES_OPERATOR_WORKER_DISPLAY_NAME,
  SALES_OPERATOR_WORKER_ID,
} from "@/src/api/sales-operator";
import { useWorkspace } from "@/src/providers/workspace-provider";

const channelLinks = [
  { href: "/sales-operator/channels", label: "All channels", icon: Radio },
  { href: "/sales-operator/channels#instagram", label: "Instagram", icon: Camera },
  { href: "/sales-operator/channels#facebook", label: "Facebook Messenger", icon: MessagesSquare },
  { href: "/sales-operator/channels#telegram", label: "Telegram", icon: Send },
];

/**
 * Agent surfaces that are planned but not built. Listed so the agent's shape is
 * legible, rendered inert so none of it looks usable. Move an entry into real
 * navigation only when its route exists.
 */
const plannedSections = ["Inbox", "Customers", "Analytics"];

export function SalesOperatorShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { workspace, status } = useWorkspace();

  const sidebar = (
    <>
      {/* Anchors the agent inside YDeck: this is one module of the workspace,
          reached from Agents, not a separate application. */}
      <Link className="sales-operator-sidebar__back" href="/agents">
        <ArrowLeft aria-hidden size={14} /> Agents
      </Link>

      <header className="sales-operator-sidebar__identity">
          <span className="sales-operator-sidebar__icon"><Bot aria-hidden size={20} /></span>
          <span>
            <small>{SALES_OPERATOR_PACKAGE_ID}</small>
            <strong>{SALES_OPERATOR_DISPLAY_NAME}</strong>
          </span>
        </header>

        <div className="sales-operator-sidebar__worker">
          <MessageCircle aria-hidden size={16} />
          <span><small>{SALES_OPERATOR_WORKER_ID}</small><strong>{SALES_OPERATOR_WORKER_DISPLAY_NAME}</strong></span>
        </div>

        <nav aria-label="Channels">
          <div className="sales-operator-sidebar__section-title">
            <span>Channels</span><ChevronRight aria-hidden size={14} />
          </div>
          {channelLinks.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/sales-operator/channels" && pathname === item.href;
            return (
              <Link key={item.label} href={item.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
                <Icon aria-hidden size={16} />{item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sales-operator-sidebar__planned">
          <div className="sales-operator-sidebar__section-title"><span>Coming soon</span></div>
          <ul>
            {plannedSections.map((section) => (
              <li key={section} aria-disabled="true">{section}</li>
            ))}
          </ul>
        </div>

      <footer>
        <small>Active workspace</small>
        <strong title={workspace?.name}>{workspace?.name ?? (status === "loading" ? "Loading workspace" : "Workspace unavailable")}</strong>
        <Link href="/settings/access">Workspace access</Link>
      </footer>
    </>
  );

  return (
    <ConsoleShell
      surfaceClassName="sales-operator-page"
      sidebar={sidebar}
      sidebarClassName="sales-operator-sidebar"
      sidebarLabel="Sales Operator"
    >
      {children}
    </ConsoleShell>
  );
}
