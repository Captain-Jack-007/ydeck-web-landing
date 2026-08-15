"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bot,
  CalendarClock,
  Camera,
  HeartPulse,
  MessagesSquare,
  Loader2,
  MessageSquareText,
  Pause,
  Play,
  RefreshCw,
  Send,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { Button, ConfirmationDialog, StatusBadge } from "@/components/account/ui";
import type { SalesChannelConnection } from "@/src/api/sales-operator";
import {
  isAuthorizationWarning,
  normalizeConnectionStatus,
  providerLabel,
  safeProviderImageUrl,
  safeSalesOperatorErrorCode,
} from "@/src/lib/sales-operator-channels";
import { useSalesOperatorChannels } from "@/src/providers/sales-operator-channels-provider";

function formatDateTime(value: string | null) {
  if (!value) return "No activity reported";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unavailable";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(parsed);
}

function ProviderIcon({ provider }: { provider: string }) {
  if (provider === "instagram") return <Camera aria-hidden size={21} />;
  if (provider === "facebook") return <MessagesSquare aria-hidden size={21} />;
  if (provider === "telegram") return <Send aria-hidden size={21} />;
  return <MessageSquareText aria-hidden size={21} />;
}

export function ChannelConnectionCard({ connection }: { connection: SalesChannelConnection }) {
  const {
    canManage,
    instagramEnabled,
    pendingAction,
    connectionActionError,
    beginInstagramConnection,
    testConnection,
    refreshAuthorization,
    pauseConnection,
    resumeConnection,
    setAutomatedReplies,
    disconnectConnection,
  } = useSalesOperatorChannels();
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [automationOpen, setAutomationOpen] = useState(false);
  const status = normalizeConnectionStatus(connection.status);
  const canManageConnection = canManage && (connection.provider !== "instagram" || instagramEnabled);
  const imageUrl = safeProviderImageUrl(connection.imageUrl);
  const actionPending = pendingAction?.startsWith(`${connection.id}:`) ?? false;
  const automationPending = pendingAction === `${connection.id}:automation`;
  const disconnectPending = pendingAction === `${connection.id}:disconnect`;
  const authorizationNeedsReconnect = [
    "authorization_expired",
    "permission_missing",
  ].includes(connection.status) || ["AUTH_EXPIRED", "AUTH_REVOKED", "PERMISSION_MISSING", "META_AUTHORIZATION_REVOKED", "META_PERMISSION_MISSING"].includes(connection.safeErrorCode ?? "");
  const refreshRequiresReconnect = connectionActionError?.connectionId === connection.id && [
    "AUTH_EXPIRED",
    "AUTH_REVOKED",
    "PERMISSION_MISSING",
    "META_AUTHORIZATION_REVOKED",
    "META_PERMISSION_MISSING",
  ].includes(connectionActionError.error.code);
  const safeError = connection.safeErrorCode ? safeSalesOperatorErrorCode(connection.safeErrorCode) : null;
  const permissionDescriptionId = `channel-permission-${connection.id}`;

  async function perform(action: () => Promise<void>) {
    try {
      await action();
    } catch {
      // The provider renders the normalized error in the shared page status region.
    }
  }

  return (
    <article className={`channel-card channel-card--${status.tone}`} aria-labelledby={`channel-title-${connection.id}`}>
      <header className="channel-card__header">
        <span className={`channel-card__avatar channel-card__avatar--${connection.provider}`}>
          {imageUrl ? <img src={imageUrl} alt="" referrerPolicy="no-referrer" /> : <ProviderIcon provider={connection.provider} />}
        </span>
        <div className="channel-card__identity">
          <span>{providerLabel(connection.provider)}</span>
          <h2 id={`channel-title-${connection.id}`} title={connection.accountName}>{connection.accountName || `${providerLabel(connection.provider)} account`}</h2>
          <p title={connection.username ?? connection.linkedBusinessName ?? undefined}>
            {connection.username ? `@${connection.username.replace(/^@/, "")}` : connection.linkedBusinessName ?? "Connected business account"}
          </p>
        </div>
        <div className="channel-card__status">
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
          <span className={connection.automatedRepliesEnabled ? "channel-automation channel-automation--on" : "channel-automation"}>
            <Bot aria-hidden size={14} /> Automated replies {connection.automatedRepliesEnabled ? "on" : "off"}
          </span>
        </div>
      </header>

      <dl className="channel-card__facts">
        <div>
          <dt><HeartPulse aria-hidden size={15} /> Last healthy</dt>
          <dd>{formatDateTime(connection.lastHealthyAt)}</dd>
        </div>
        <div>
          <dt><MessageSquareText aria-hidden size={15} /> Last inbound activity</dt>
          <dd>{formatDateTime(connection.lastInboundEventAt)}</dd>
        </div>
        <div>
          <dt><CalendarClock aria-hidden size={15} /> Authorization</dt>
          <dd>{connection.authorizationExpiresAt ? `Expires ${formatDateTime(connection.authorizationExpiresAt)}` : "No expiry reported"}</dd>
        </div>
      </dl>

      {isAuthorizationWarning(connection.authorizationExpiresAt) ? (
        <div className="channel-card__notice channel-card__notice--warning" role="status">
          <AlertTriangle aria-hidden size={16} />
          <span><strong>Authorization expires soon.</strong> Refresh authorization to avoid interrupted message processing.</span>
        </div>
      ) : null}

      {connection.safeErrorCode ? (
        <div className="channel-card__notice channel-card__notice--danger" role="alert">
          <ShieldAlert aria-hidden size={16} />
          <span>
            <strong>{safeError?.message ?? "This channel needs attention."}</strong>
            <small>{safeError?.remediation}</small>
          </span>
        </div>
      ) : null}

      {!canManageConnection ? (
        <p className="channel-card__permission" id={permissionDescriptionId} role="note">
          {!instagramEnabled && connection.provider === "instagram"
            ? "Instagram management is disabled by the workspace Cloud feature. You can still review connection status."
            : <>Channel management requires <code>sales_operator.channel.manage</code>. You can still review connection status.</>}
        </p>
      ) : null}

      <footer className="channel-card__actions" aria-live="polite">
        <Button
          type="button"
          variant="secondary"
          loading={pendingAction === `${connection.id}:test`}
          loadingLabel="Testing…"
          disabled={!canManageConnection || actionPending || connection.status === "disconnected"}
          aria-describedby={!canManageConnection ? permissionDescriptionId : undefined}
          onClick={() => void perform(() => testConnection(connection.id))}
        >
          <HeartPulse aria-hidden size={15} /> Test connection
        </Button>

        {(authorizationNeedsReconnect || refreshRequiresReconnect) && connection.provider === "instagram" ? (
          <Button
            type="button"
            disabled={!canManageConnection || actionPending}
            aria-describedby={!canManageConnection ? permissionDescriptionId : undefined}
            onClick={() => void beginInstagramConnection()}
          >
            <RefreshCw aria-hidden size={15} /> Reconnect Instagram
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            loading={pendingAction === `${connection.id}:refresh`}
            loadingLabel="Refreshing…"
            disabled={!canManageConnection || actionPending || connection.status === "disconnected"}
            aria-describedby={!canManageConnection ? permissionDescriptionId : undefined}
            onClick={() => void perform(() => refreshAuthorization(connection.id))}
          >
            <RefreshCw aria-hidden size={15} /> Refresh authorization
          </Button>
        )}

        {connection.status === "paused" ? (
          <Button
            type="button"
            variant="secondary"
            loading={pendingAction === `${connection.id}:resume`}
            loadingLabel="Resuming…"
            disabled={!canManageConnection || actionPending}
            aria-describedby={!canManageConnection ? permissionDescriptionId : undefined}
            onClick={() => void perform(() => resumeConnection(connection.id))}
          >
            <Play aria-hidden size={15} /> Resume
          </Button>
        ) : connection.status !== "disconnected" ? (
          <Button
            type="button"
            variant="secondary"
            loading={pendingAction === `${connection.id}:pause`}
            loadingLabel="Pausing…"
            disabled={!canManageConnection || actionPending || ["connecting", "account_selection_required"].includes(connection.status)}
            aria-describedby={!canManageConnection ? permissionDescriptionId : undefined}
            onClick={() => void perform(() => pauseConnection(connection.id))}
          >
            <Pause aria-hidden size={15} /> Pause
          </Button>
        ) : null}

        {connection.status !== "disconnected" ? (
          <label className={`channel-switch${connection.automatedRepliesEnabled ? " channel-switch--enabled" : ""}`}>
            <input
              type="checkbox"
              checked={connection.automatedRepliesEnabled}
              disabled={!canManageConnection || actionPending || !["active", "paused"].includes(connection.status)}
              aria-describedby={!canManageConnection ? permissionDescriptionId : undefined}
              onChange={(event) => {
                if (event.target.checked) setAutomationOpen(true);
                else void perform(() => setAutomatedReplies(connection.id, false));
              }}
            />
            <span aria-hidden><i /></span>
            <strong>{automationPending ? <Loader2 aria-hidden className="workspace-spin" size={14} /> : <Bot aria-hidden size={14} />} Automated replies</strong>
          </label>
        ) : null}

        {connection.status !== "disconnected" ? (
          <Button
            type="button"
            variant="danger"
            disabled={!canManageConnection || actionPending}
            aria-describedby={!canManageConnection ? permissionDescriptionId : undefined}
            onClick={() => setDisconnectOpen(true)}
          >
            <Trash2 aria-hidden size={15} /> Disconnect
          </Button>
        ) : null}
      </footer>

      <ConfirmationDialog
        open={automationOpen}
        title="Enable automated replies?"
        description={`Sales Agent may send autonomous replies through ${connection.accountName}. Cloud readiness and approved knowledge requirements still apply.`}
        confirmLabel="Enable automated replies"
        confirmVariant="primary"
        loading={automationPending}
        onCancel={() => setAutomationOpen(false)}
        onConfirm={() => void (async () => {
          try {
            await setAutomatedReplies(connection.id, true);
            setAutomationOpen(false);
          } catch {
            // Shared safe error remains visible and the dialog stays open for recovery.
          }
        })()}
      />

      <ConfirmationDialog
        open={disconnectOpen}
        title={`Disconnect ${providerLabel(connection.provider)}?`}
        description="Sales Operator will stop using this account and Cloud will revoke or invalidate provider authorization according to policy. CRM customers, leads, conversations, messages, and audit history are not deleted."
        confirmLabel="Disconnect channel"
        loading={disconnectPending}
        onCancel={() => setDisconnectOpen(false)}
        onConfirm={() => void (async () => {
          try {
            await disconnectConnection(connection.id);
            setDisconnectOpen(false);
          } catch {
            // Shared safe error remains visible and the dialog stays open for recovery.
          }
        })()}
      />
    </article>
  );
}
