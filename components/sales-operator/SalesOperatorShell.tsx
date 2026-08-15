"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Camera, ChevronRight, MessageCircle, MessagesSquare, Radio, Send } from "lucide-react";
import type { ReactNode } from "react";
import { ProductTopBar } from "@/components/workspace/ProductTopBar";
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

export function SalesOperatorShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { workspace, status } = useWorkspace();

  return (
    <main className="sales-operator-page">
      <ProductTopBar />
      <aside className="sales-operator-sidebar" aria-label="Sales Operator navigation">
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

        <footer>
          <small>Active workspace</small>
          <strong title={workspace?.name}>{workspace?.name ?? (status === "loading" ? "Loading workspace" : "Workspace unavailable")}</strong>
          <Link href="/settings/access">Workspace access</Link>
        </footer>
      </aside>
      <section className="sales-operator-content">
        <div className="sales-operator-content__body">{children}</div>
      </section>
    </main>
  );
}
