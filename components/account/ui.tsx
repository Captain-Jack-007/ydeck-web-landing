"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import {
  AlertCircle,
  Activity,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  CheckCircle2,
  CreditCard,
  FileText,
  Info,
  Laptop,
  Loader2,
  Menu,
  Shield,
  ShieldCheck,
  Settings,
  TriangleAlert,
  User,
  UsersRound,
  X,
} from "lucide-react";
import { useBilling } from "@/src/providers/billing-provider";
import { useWorkspace } from "@/src/providers/workspace-provider";
import { getHumanErrorMessage } from "@/src/api/client";
import { ProductTopBar } from "@/components/workspace/ProductTopBar";

export function Button({
  children,
  loading,
  loadingLabel = "Working…",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const { className, ...rest } = props;
  return (
    <button
      {...rest}
      aria-busy={loading || undefined}
      className={["account-button", `account-button--${variant}`, className].filter(Boolean).join(" ")}
      disabled={rest.disabled || loading}
    >
      {loading ? (
        <>
          <Loader2 aria-hidden className="account-button__spinner" size={17} />
          <span aria-live="polite">{loadingLabel}</span>
        </>
      ) : children}
    </button>
  );
}

export function TextInput({
  label,
  hint,
  error,
  trailing,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string | null;
  trailing?: ReactNode;
}) {
  const { className, ...rest } = props;
  return (
    <label className="account-field">
      <span>{label}</span>
      {trailing ? (
        <span className="account-field__control">
          <input className={className} {...rest} />
          {trailing}
        </span>
      ) : (
        <input className={className} {...rest} />
      )}
      {hint ? <small>{hint}</small> : null}
      {error ? <strong role="alert">{error}</strong> : null}
    </label>
  );
}

export function PasswordInput({ trailing, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string | null; trailing?: ReactNode }) {
  return <TextInput {...props} trailing={trailing} />;
}

export function SelectInput({
  label,
  children,
  hint,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  const { className, ...rest } = props;
  return (
    <label className="account-field">
      <span>{label}</span>
      <select className={className} {...rest}>
        {children}
      </select>
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

export function Alert({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "success" | "warning" | "danger";
  title?: string;
  children: ReactNode;
}) {
  const Icon = tone === "danger" ? AlertCircle : tone === "warning" ? TriangleAlert : tone === "success" ? CheckCircle2 : Info;
  const requestIdMatch = typeof children === "string"
    ? children.match(/^(.*?)(?:\s+Request ID:\s+([A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*)\.?)$/)
    : null;
  return (
    <div className={`account-alert account-alert--${tone}`} role={tone === "danger" ? "alert" : "status"}>
      <Icon aria-hidden size={17} />
      <div>
        {title ? <strong>{title}</strong> : null}
        {requestIdMatch ? (
          <>
            <span>{requestIdMatch[1]}</span>
            <details className="account-alert__details">
              <summary>Technical details</summary>
              <small>Request ID: {requestIdMatch[2]}</small>
            </details>
          </>
        ) : (
          <span>{children}</span>
        )}
      </div>
    </div>
  );
}

export function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: string }) {
  const safeTone = tone.toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
  return <span className={`account-badge account-badge--${safeTone}`}>{children}</span>;
}

export function SkeletonBlock({ rows = 3 }: { rows?: number }) {
  return (
    <div className="account-skeleton-stack" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

export function ErrorDetails({
  requestId,
  category,
  timestamp,
}: {
  requestId: string | null;
  category: string;
  timestamp: string;
}) {
  return (
    <details className="account-error-details">
      <summary>Technical details</summary>
      <dl>
        <div><dt>Request ID</dt><dd>{requestId ?? "Not provided"}</dd></div>
        <div><dt>Error category</dt><dd>{category}</dd></div>
        <div><dt>Timestamp</dt><dd>{timestamp}</dd></div>
      </dl>
    </details>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="account-empty">
      {icon ? <div className="account-empty__icon">{icon}</div> : null}
      <h3>{title}</h3>
      <p>{children}</p>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

function BrandMark() {
  return (
    <span className="account-brand-mark" aria-hidden>
      <Image src="/ydeck.png" alt="" width={32} height={41} className="account-brand-mark__image" priority />
    </span>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="auth-page">
      <section className="auth-layout" aria-labelledby="auth-title">
        <aside className="auth-visual" aria-label="YDeck account platform">
          <Link className="auth-brand auth-brand--inverse" href="/">
            <BrandMark />
            <strong>YDeck</strong>
          </Link>
          <div className="auth-visual__copy">
            <p className="auth-kicker">YDeck Cloud</p>
            <h2>Your YDeck workspace, ready when you are.</h2>
            <p>
              Manage your workspace and connect authorized YDeck Desktop devices from one account.
            </p>
          </div>
        </aside>

        <div className="auth-form-column">
          <section className="auth-card" aria-labelledby="auth-title">
            <Link className="auth-brand auth-brand--compact" href="/">
              <BrandMark />
              <strong>YDeck</strong>
            </Link>
            <div className="auth-card__heading">
              <p className="auth-kicker">Account access</p>
              <h1 id="auth-title">{title}</h1>
              <p>{subtitle}</p>
            </div>
            {children}
            {footer ? <div className="auth-footer">{footer}</div> : null}
          </section>
        </div>
      </section>
    </main>
  );
}

const settingsNav = [
  {
    group: "Personal",
    items: [
      { href: "/settings/profile", label: "Profile", icon: User },
      { href: "/settings/security", label: "Security", icon: Shield },
    ],
  },
  {
    group: "Desktop",
    items: [{ href: "/settings/devices", label: "Devices", icon: Laptop }],
  },
  {
    group: "Workspace",
    items: [
      { href: "/settings/access", label: "Access", icon: UsersRound },
      { href: "/settings/billing", label: "Billing", icon: CreditCard },
      { href: "/settings/plans", label: "Plans", icon: BadgeCheck },
      { href: "/settings/invoices", label: "Invoices", icon: FileText },
    ],
  },
  {
    group: "Account",
    items: [{ href: "/settings/account", label: "Account & data", icon: Settings }],
  },
];

function SettingsNavigation({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="settings-nav settings-nav--grouped" aria-label="Settings sections">
      {settingsNav.map((group) => (
        <div className="settings-nav-group" key={group.group}>
          <span>{group.group}</span>
          {group.items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                className={active ? "active" : ""}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
              >
                <Icon aria-hidden size={17} />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function WorkspaceSwitcher({
  workspace,
  workspaces,
  status,
  onSelect,
}: {
  workspace: ReturnType<typeof useWorkspace>["workspace"];
  workspaces: ReturnType<typeof useWorkspace>["workspaces"];
  status: ReturnType<typeof useWorkspace>["status"];
  onSelect: (workspaceId: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }
    const handlePointerDown = (event: MouseEvent) => {
      if (!switcherRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        switcherRef.current?.querySelector<HTMLButtonElement>(".settings-workspace-trigger")?.focus();
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="settings-workspace-switcher" ref={switcherRef}>
      <button
        className="settings-workspace-trigger"
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        disabled={status === "loading"}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="settings-workspace-trigger__icon"><Building2 aria-hidden size={16} /></span>
        <span className="settings-workspace-trigger__copy">
          <strong title={workspace?.name}>{workspace?.name ?? "Workspace"}</strong>
          <small>{workspaces.length === 1 ? "1 available workspace" : `${workspaces.length} available workspaces`}</small>
        </span>
        {status === "loading" ? <Loader2 aria-hidden className="account-button__spinner" size={16} /> : <ChevronDown aria-hidden size={16} />}
      </button>
      {open ? (
        <div className="settings-workspace-menu" id={menuId} role="menu" aria-label="Choose workspace">
          <div className="settings-workspace-menu__heading">Switch workspace</div>
          {workspaces.map((item) => {
            const active = item.id === workspace?.id;
            return (
              <button
                key={item.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setOpen(false);
                  if (!active) {
                    void onSelect(item.id);
                  }
                }}
              >
                <span className="settings-workspace-menu__mark"><Building2 aria-hidden size={15} /></span>
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.type === "personal" ? "Personal workspace" : item.role ? `${item.role} access` : "Workspace"}</small>
                </span>
                {active ? <Check aria-hidden size={16} /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function SettingsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { workspace, workspaces, selectWorkspace, refreshWorkspace, status, error, membership } = useWorkspace();
  const { summary } = useBilling();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const activeItem = settingsNav.flatMap((group) => group.items).find((item) => item.href === pathname);
  const ActiveItemIcon = activeItem?.icon ?? Settings;

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const drawer = document.getElementById("settings-mobile-drawer");
    const focusableSelector =
      'button:not([disabled]), [href], select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    window.requestAnimationFrame(() => drawer?.querySelector<HTMLElement>(focusableSelector)?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        mobileMenuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !drawer) {
        return;
      }
      const focusable = Array.from(drawer.querySelectorAll<HTMLElement>(focusableSelector));
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  const sidebarContent = (mobile = false) => (
    <>
      {mobile ? (
        <div className="settings-sidebar__mobile-actions">
          <button className="settings-mobile-close" type="button" onClick={() => setMobileOpen(false)} aria-label="Close settings menu">
            <X aria-hidden size={20} />
          </button>
        </div>
      ) : null}

      <div className={`settings-workspace-card${workspace ? "" : " settings-workspace-card--personal"}`}>
        <span className="settings-workspace-card__label">Workspace</span>
        {(status === "loading" || status === "idle") && workspaces.length === 0 ? (
          <div className="settings-workspace-state" aria-live="polite">
            <Loader2 aria-hidden className="account-button__spinner" size={17} />
            <span><strong>Loading workspaces</strong><small>Restoring account context</small></span>
          </div>
        ) : status === "error" ? (
          <div className="settings-workspace-state" aria-live="polite">
            <AlertCircle aria-hidden size={17} />
            <span><strong>Workspace unavailable</strong><small>Server context was not restored</small></span>
            <Button type="button" variant="ghost" onClick={() => void refreshWorkspace()}>
              Retry
            </Button>
          </div>
        ) : workspaces.length > 0 ? (
          <>
            <WorkspaceSwitcher workspace={workspace} workspaces={workspaces} status={status} onSelect={selectWorkspace} />
            <div className="settings-context__meta">
              <StatusBadge tone={membership?.role ?? "neutral"}>{membership?.role ?? "Role unavailable"}</StatusBadge>
              {summary?.subscription ? (
                <StatusBadge tone={summary.subscription.planKey === "free" ? "free" : "paid"}>
                  {summary.subscription.planName ?? summary.subscription.planKey}
                </StatusBadge>
              ) : status === "loading" ? (
                <span className="settings-context__loading">Loading billing context</span>
              ) : null}
            </div>
          </>
        ) : (
          <div className="settings-workspace-state">
            <Building2 aria-hidden size={17} />
            <span><strong>Workspace unavailable</strong><small>Retry to restore server context</small></span>
          </div>
        )}
      </div>
      {error ? <div className="settings-sidebar__error"><Alert tone="danger">{error}</Alert></div> : null}
      <SettingsNavigation pathname={pathname} onNavigate={mobile ? () => setMobileOpen(false) : undefined} />
    </>
  );

  return (
    <main className="settings-page">
      <ProductTopBar />
      <aside className="settings-sidebar settings-sidebar--desktop" aria-label="Settings navigation">
        {sidebarContent()}
      </aside>
      <header className="settings-mobile-bar">
        <div className="settings-mobile-brand">
          <span className="settings-mobile-brand__icon"><ActiveItemIcon aria-hidden size={18} /></span>
          <span>
            <strong>{activeItem?.label ?? "Settings"}</strong>
            <small>Account settings</small>
          </span>
        </div>
        <button
          ref={mobileMenuButtonRef}
          className="settings-mobile-menu"
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="settings-mobile-drawer"
          onClick={() => setMobileOpen(true)}
        >
          <Menu aria-hidden size={20} />
          <span>Menu</span>
        </button>
      </header>
      {mobileOpen ? (
        <div className="settings-mobile-backdrop" role="presentation" onMouseDown={() => setMobileOpen(false)}>
          <aside
            id="settings-mobile-drawer"
            className="settings-sidebar settings-sidebar--mobile"
            role="dialog"
            aria-modal="true"
            aria-label="Settings menu"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {sidebarContent(true)}
          </aside>
        </div>
      ) : null}
      <section className="settings-content">
        <div className="settings-content__body">{children}</div>
      </section>
    </main>
  );
}

export function SettingsHeader({
  title,
  description,
  action,
  scope = "Account",
}: {
  title: string;
  description: string;
  action?: ReactNode;
  scope?: "Personal" | "Desktop" | "Workspace" | "Account";
}) {
  const HeaderIcon = title === "Profile"
    ? User
    : title === "Security"
      ? ShieldCheck
      : title === "Devices"
        ? Laptop
        : title === "Workspace access"
          ? UsersRound
        : title === "Billing"
          ? CreditCard
          : title === "Plans"
            ? BadgeCheck
            : title === "Invoices"
              ? FileText
              : title === "Account" || title === "Account and data"
                ? Settings
                : Activity;
  const scopeLabel = scope === "Personal"
    ? "Personal settings"
    : scope === "Desktop"
      ? "Desktop access"
      : scope === "Workspace"
        ? "Workspace settings"
        : "Account and data";

  return (
    <header className="settings-header">
      <div className="settings-header__identity">
        <span className="settings-header__icon" aria-hidden><HeaderIcon size={21} /></span>
        <div>
          <span className="settings-header__scope">{scopeLabel}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
      {action ? <div className="settings-header__action">{action}</div> : null}
    </header>
  );
}

export function Panel({
  children,
  title,
  description,
  action,
  className,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={["account-panel", className].filter(Boolean).join(" ")}>
      {title || description ? (
        <div className="account-panel__heading">
          <div>
            {title ? <h2>{title}</h2> : null}
            {description ? <p>{description}</p> : null}
          </div>
          {action ? <div className="account-panel__action">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function SettingsRow({
  icon,
  label,
  value,
  detail,
  status,
  action,
  className,
}: {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  status?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={["settings-row", className].filter(Boolean).join(" ")}>
      {icon ? <span className="settings-row__icon" aria-hidden>{icon}</span> : null}
      <div className="settings-row__body">
        <span>{label}</span>
        <strong>{value}</strong>
        {detail ? <small>{detail}</small> : null}
      </div>
      {status ? <div className="settings-row__status">{status}</div> : null}
      {action ? <div className="settings-row__action">{action}</div> : null}
    </div>
  );
}

export function RecoveryState({
  title,
  description,
  message,
  requestId,
  category,
  timestamp,
  onRetry,
}: {
  title: string;
  description: string;
  message: string;
  requestId: string | null;
  category: string;
  timestamp: string;
  onRetry: () => void;
}) {
  const safeMessage = message.replace(/\s+Request ID:\s+[A-Za-z0-9_.-]+\.?$/, "");

  return (
    <section className="settings-recovery" aria-labelledby="settings-recovery-title">
      <span className="settings-recovery__icon"><AlertCircle aria-hidden size={20} /></span>
      <div className="settings-recovery__body">
        <h2 id="settings-recovery-title">{title}</h2>
        <p>{description}</p>
        <div className="settings-recovery__message" role="alert">{safeMessage}</div>
        <div className="settings-recovery__footer">
          <Button type="button" variant="secondary" onClick={onRetry}>Retry</Button>
          <ErrorDetails requestId={requestId} category={category} timestamp={timestamp} />
        </div>
      </div>
    </section>
  );
}

export function WorkspaceRequiredState({
  title = "Workspace required",
  description = "Select a workspace before opening billing, plans, invoices, or workspace-scoped access controls.",
}: {
  title?: string;
  description?: string;
}) {
  const { workspaces, selectWorkspace, createWorkspace, refreshWorkspace, status, error } = useWorkspace();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleCreateWorkspace() {
    const name = workspaceName.trim();
    if (name.length < 2) {
      setActionError("Enter a workspace name with at least 2 characters.");
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      await createWorkspace({ name });
      setCreateDialogOpen(false);
      setWorkspaceName("");
    } catch (error) {
      setActionError(getHumanErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading" || status === "idle") {
    return (
      <section className="workspace-required" aria-live="polite" aria-busy="true">
        <div className="workspace-required__icon" aria-hidden>
          <Loader2 className="account-button__spinner" size={22} />
        </div>
        <div>
          <h2>Restoring workspace</h2>
          <p>YDeck is loading the workspace selected by your authenticated session.</p>
          <SkeletonBlock rows={3} />
        </div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="workspace-required" aria-live="polite">
        <div className="workspace-required__icon" aria-hidden>
          <AlertCircle size={22} />
        </div>
        <div>
          <h2>Workspace unavailable</h2>
          <p>YDeck could not restore the workspace selected by your account. Your workspace data remains protected.</p>
          {error ? <Alert tone="danger">{error}</Alert> : null}
          <div className="account-actions">
            <Button type="button" variant="secondary" onClick={() => void refreshWorkspace()}>
              Retry workspace
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="workspace-required" aria-live="polite">
        <div className="workspace-required__icon" aria-hidden>
          <Building2 size={22} />
        </div>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
          <div className="workspace-required__features" aria-label="Workspace features">
            <span>Subscription and payment state</span>
            <span>Plan limits and usage</span>
            <span>Invoice history and permissions</span>
          </div>
          <div className="account-actions">
            <Button type="button" onClick={() => setCreateDialogOpen(true)}>
              Create workspace
            </Button>
            {workspaces[0] ? (
              <Button type="button" variant="secondary" onClick={() => void selectWorkspace(workspaces[0].id)}>
                Use {workspaces[0].name}
              </Button>
            ) : null}
          </div>
        </div>
      </section>
      <ConfirmationDialog
        open={createDialogOpen}
        title="Create a workspace"
        description="Workspaces keep billing, plan limits, and shared access separate from your personal account."
        confirmLabel="Create workspace"
        confirmVariant="primary"
        loading={busy}
        disabled={workspaceName.trim().length < 2}
        onCancel={() => {
          setCreateDialogOpen(false);
          setActionError(null);
        }}
        onConfirm={() => void handleCreateWorkspace()}
      >
        <div className="account-form">
          {actionError ? <Alert tone="danger">{actionError}</Alert> : null}
          <TextInput
            label="Workspace name"
            autoFocus
            value={workspaceName}
            maxLength={80}
            onChange={(event) => setWorkspaceName(event.target.value)}
            placeholder="Design team"
          />
        </div>
      </ConfirmationDialog>
    </>
  );
}

export function StatusSummary({ children }: { children: ReactNode }) {
  return <div className="status-summary">{children}</div>;
}

export function StatusItem({
  label,
  value,
  detail,
  tone = "neutral",
  icon,
  statusLabel,
  action,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  tone?: string;
  icon?: ReactNode;
  statusLabel?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="status-item">
      {icon ? <span className={`status-item__icon status-item__icon--${tone}`} aria-hidden>{icon}</span> : null}
      <div className="status-item__body">
        <span>{label}</span>
        <strong>{value}</strong>
        {detail ? <small>{detail}</small> : null}
      </div>
      <div className="status-item__side">
        {statusLabel ? <StatusBadge tone={tone}>{statusLabel}</StatusBadge> : null}
        {action}
      </div>
    </div>
  );
}

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmVariant = "danger",
  loading,
  disabled,
  children,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    window.requestAnimationFrame(() => {
      const preferred = dialogRef.current?.querySelector<HTMLElement>("[autofocus]");
      const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(focusableSelector);
      (preferred ?? firstFocusable ?? dialogRef.current)?.focus();
    });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector));
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="account-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <section
        ref={dialogRef}
        className="account-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
      >
        <button className="account-dialog__close" type="button" onClick={onCancel} aria-label="Close dialog">
          <X aria-hidden size={17} />
        </button>
        <div className="account-dialog__heading">
          <h2 id={titleId}>{title}</h2>
          <p id={descriptionId}>{description}</p>
        </div>
        {children ? <div className="account-dialog__body">{children}</div> : null}
        <div className="account-dialog__actions">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" variant={confirmVariant} loading={loading} disabled={disabled} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}

export function DangerZone({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <details className="danger-zone">
      <summary>
        <span>
          <strong>{title}</strong>
          <small>{description}</small>
        </span>
        <ArrowRight aria-hidden size={17} />
      </summary>
      <div className="danger-zone__content">{children}</div>
    </details>
  );
}
