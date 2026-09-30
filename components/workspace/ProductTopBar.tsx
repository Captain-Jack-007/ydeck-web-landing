"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  ChevronDown,
  CreditCard,
  Crown,
  Loader2,
  LogOut,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ConsoleNav } from "@/components/console/ConsoleNav";
import { useAuth } from "@/src/providers/auth-provider";
import { useBilling } from "@/src/providers/billing-provider";
import { useWorkspace } from "@/src/providers/workspace-provider";

type ActivePopover = "plan" | "account" | null;

function formatStatus(value: string) {
  return value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

export function ProductTopBar() {
  const { user, signOut } = useAuth();
  const { summary, status: billingStatus } = useBilling();
  const { workspace, status: workspaceStatus } = useWorkspace();
  const [activePopover, setActivePopover] = useState<ActivePopover>(null);
  const [signingOut, setSigningOut] = useState(false);
  const controlsRef = useRef<HTMLDivElement>(null);
  const planButtonRef = useRef<HTMLButtonElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!activePopover) {
      return;
    }

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!controlsRef.current?.contains(event.target as Node)) {
        setActivePopover(null);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      const trigger = activePopover === "plan" ? planButtonRef.current : accountButtonRef.current;
      setActivePopover(null);
      trigger?.focus();
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [activePopover]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  }

  const displayName = user?.displayName?.trim() || null;
  const email = user?.primaryEmail || null;
  const identityTitle = displayName || email || "YDeck account";
  const identitySubtitle = displayName ? email : null;
  const initial = identityTitle.trim().charAt(0).toUpperCase();
  const planName = summary?.subscription.planName
    ?? summary?.subscription.planKey
    ?? (billingStatus === "loading" ? "Loading" : workspace ? "Unavailable" : "Personal");
  const planStatus = summary?.subscription.status
    ? formatStatus(summary.subscription.status)
    : workspace ? "Unavailable" : "Free";
  const workspaceLabel = workspace?.name
    ?? (workspaceStatus === "loading" || workspaceStatus === "idle" ? "Restoring workspace" : "Workspace unavailable");

  return (
    <header className="workspace-topbar workspace-topbar--portal">
      <Link className="workspace-topbar__brand" href="/workspace" aria-label="YDeck home">
        <Image src="/ydeck.png" alt="" width={25} height={32} priority />
        <strong>YDeck</strong>
      </Link>
      <ConsoleNav />
      <div className="workspace-topbar__spacer" />

      <div className="portal-topbar__controls" ref={controlsRef}>
        <div className="portal-topbar__control">
          <button
            ref={planButtonRef}
            className="portal-topbar__plan-trigger"
            type="button"
            aria-label={`Current plan: ${planName}`}
            aria-expanded={activePopover === "plan"}
            aria-haspopup="menu"
            aria-controls="portal-plan-menu"
            onClick={() => setActivePopover((current) => current === "plan" ? null : "plan")}
          >
            <Sparkles aria-hidden size={19} />
          </button>

          {activePopover === "plan" ? (
            <div className="portal-topbar__popover portal-topbar__plan-popover" id="portal-plan-menu" role="menu" aria-label="Plan menu">
              <header>
                <span className="portal-topbar__plan-icon"><Crown aria-hidden size={19} /></span>
                <div><small>Current plan</small><strong>{planName}</strong></div>
                <span className="portal-topbar__status">{planStatus}</span>
              </header>
              <p>Review available plans and choose the limits that fit your Desktop workflow.</p>
              <div className="portal-topbar__plan-actions">
                <Link className="portal-topbar__primary-action" href="/settings/plans" role="menuitem" onClick={() => setActivePopover(null)}>
                  Upgrade plan <Crown aria-hidden size={15} />
                </Link>
                <Link href="/settings/billing" role="menuitem" onClick={() => setActivePopover(null)}>
                  <CreditCard aria-hidden size={16} />Manage billing
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        <div className="portal-topbar__control">
          <button
            ref={accountButtonRef}
            className="portal-topbar__account-trigger"
            type="button"
            aria-label={`Open account menu for ${identityTitle}`}
            aria-expanded={activePopover === "account"}
            aria-haspopup="menu"
            aria-controls="portal-account-menu"
            onClick={() => setActivePopover((current) => current === "account" ? null : "account")}
          >
            <span className="workspace-avatar">
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" /> : initial}
            </span>
            <ChevronDown aria-hidden size={15} />
          </button>

          {activePopover === "account" ? (
            <div className="portal-topbar__popover portal-topbar__account-popover" id="portal-account-menu" role="menu" aria-label="Account menu">
              <header className="portal-topbar__identity">
                <span className="workspace-avatar workspace-avatar--large">
                  {user?.avatarUrl ? <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" /> : initial}
                </span>
                <span><strong>{identityTitle}</strong>{identitySubtitle ? <small>{identitySubtitle}</small> : null}</span>
              </header>

              <div className="portal-topbar__workspace">
                <Building2 aria-hidden size={17} />
                <span>
                  <small>{workspace?.type === "organization" ? "Business workspace" : "Personal workspace"}</small>
                  <strong>{workspaceLabel}</strong>
                </span>
              </div>

              {/* Account-scoped only. Product destinations live in ConsoleNav,
                  not in the avatar menu. Settings sits here so it does not
                  compete with the primary product navigation. */}
              <nav className="portal-topbar__settings" aria-label="Account">
                <Link href="/settings/profile" role="menuitem" onClick={() => setActivePopover(null)}><User aria-hidden size={17} /><span><strong>Profile</strong><small>Name, avatar, and preferences</small></span></Link>
                <Link href="/settings/billing" role="menuitem" onClick={() => setActivePopover(null)}><CreditCard aria-hidden size={17} /><span><strong>Billing and plan</strong><small>Subscription, usage, and invoices</small></span></Link>
                <Link href="/settings/account" role="menuitem" onClick={() => setActivePopover(null)}><Settings aria-hidden size={17} /><span><strong>Settings</strong><small>Security, devices, and workspace access</small></span></Link>
              </nav>

              <button className="portal-topbar__sign-out" type="button" role="menuitem" disabled={signingOut} onClick={() => void handleSignOut()}>
                {signingOut ? <Loader2 aria-hidden className="workspace-spin" size={17} /> : <LogOut aria-hidden size={17} />}
                {signingOut ? "Signing out" : "Sign out"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
