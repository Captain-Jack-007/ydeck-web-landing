"use client";

import { AlertCircle, Camera, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { Alert, Button, EmptyState, ErrorDetails } from "@/components/account/ui";
import { ChannelConnectionCard } from "@/components/sales-operator/ChannelConnectionCard";
import { useSalesOperatorChannels } from "@/src/providers/sales-operator-channels-provider";
import { useWorkspace } from "@/src/providers/workspace-provider";

function ChannelSkeleton() {
  return (
    <div className="channel-skeleton" aria-label="Loading connected channels">
      {Array.from({ length: 2 }, (_, index) => <span key={index} />)}
    </div>
  );
}

export function ChannelsPage() {
  const { workspace, status: workspaceStatus, error: workspaceError } = useWorkspace();
  const {
    status,
    connections,
    error,
    canManage,
    instagramEnabled,
    pendingAction,
    refreshChannels,
    beginInstagramConnection,
  } = useSalesOperatorChannels();
  const instagramConnections = connections.filter((connection) => connection.provider === "instagram");
  const facebookConnections = connections.filter((connection) => connection.provider === "facebook");
  const telegramConnections = connections.filter((connection) => connection.provider === "telegram");
  const otherConnections = connections.filter((connection) => !["instagram", "facebook", "telegram"].includes(connection.provider));
  const connectDisabledDescription = !instagramEnabled
    ? "Instagram is not enabled for this workspace by the agents.sales_operator.instagram_enabled Cloud feature."
    : "Connecting Instagram requires sales_operator.channel.manage permission.";
  const canConnectInstagram = canManage && instagramEnabled;

  if (workspaceStatus === "loading" || workspaceStatus === "idle") {
    return <ChannelSkeleton />;
  }

  if (!workspace || workspaceStatus === "error") {
    return (
      <section className="channels-recovery" aria-labelledby="channels-workspace-error">
        <AlertCircle aria-hidden size={22} />
        <div>
          <h1 id="channels-workspace-error">Workspace context unavailable</h1>
          <p>{workspaceError ?? "Sales Operator channels cannot load without an authoritative active workspace."}</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <header className="channels-header">
        <div>
          <span>Sales Operator / Channels</span>
          <h1>Connected customer channels</h1>
          <p>Connect Instagram business accounts and manage the channels Sales Agent can use in <strong>{workspace.name}</strong>.</p>
        </div>
        <div className="channels-header__actions">
          <Button
            type="button"
            variant="secondary"
            loading={status === "loading" && connections.length > 0}
            disabled={Boolean(pendingAction)}
            onClick={() => void refreshChannels()}
          >
            <RefreshCw aria-hidden size={15} /> Refresh
          </Button>
          <Button
            type="button"
            loading={pendingAction === "instagram:begin"}
            loadingLabel="Starting…"
            disabled={!canConnectInstagram || Boolean(pendingAction)}
            aria-describedby={!canConnectInstagram ? "connect-instagram-permission" : undefined}
            onClick={() => void beginInstagramConnection()}
          >
            <Camera aria-hidden size={16} /> Connect Instagram
          </Button>
        </div>
      </header>

      {!canConnectInstagram ? (
        <Alert tone="warning" title={!instagramEnabled ? "Instagram unavailable" : "Read-only channel access"}>
          <span id="connect-instagram-permission">{connectDisabledDescription}</span>
        </Alert>
      ) : null}

      {error ? (
        <div className="channels-error">
          <Alert tone="danger" title={error.message}>{error.remediation}</Alert>
          {error.requestId ? <ErrorDetails requestId={error.requestId} category={error.code.toLowerCase()} timestamp={new Date().toISOString()} /> : null}
        </div>
      ) : null}

      <section className="instagram-connect-panel" id="instagram" aria-labelledby="instagram-connect-title">
        <div className="instagram-connect-panel__icon"><Camera aria-hidden size={24} /></div>
        <div>
          <h2 id="instagram-connect-title">Instagram business messaging</h2>
          <p>Instagram connection requires an eligible professional account linked through Meta&apos;s supported business configuration. Personal accounts are not automatically eligible.</p>
        </div>
        <span><ShieldCheck aria-hidden size={15} /> OAuth and credentials are handled by YDeck Cloud</span>
      </section>

      {status === "loading" ? (
        <ChannelSkeleton />
      ) : status === "error" && connections.length === 0 ? (
        <EmptyState
          icon={<AlertCircle aria-hidden size={21} />}
          title="Connected channels unavailable"
          action={<Button type="button" variant="secondary" onClick={() => void refreshChannels()}>Try again</Button>}
        >
          YDeck could not load channel connections for this workspace. No connection settings were changed.
        </EmptyState>
      ) : connections.length === 0 ? (
        <EmptyState
          icon={<Camera aria-hidden size={21} />}
          title="No customer channels connected"
          action={
            <Button type="button" disabled={!canConnectInstagram} aria-describedby={!canConnectInstagram ? "connect-instagram-permission" : undefined} onClick={() => void beginInstagramConnection()}>
              Connect Instagram
            </Button>
          }
        >
          Connect an eligible Instagram professional account. Automated replies remain off until you explicitly enable them and Cloud confirms readiness.
        </EmptyState>
      ) : (
        <div className="channels-groups">
          {instagramConnections.length ? <ChannelGroup title="Instagram" id="instagram-connections" connections={instagramConnections} /> : null}
          {facebookConnections.length ? <ChannelGroup title="Facebook Messenger" id="facebook" connections={facebookConnections} /> : null}
          {telegramConnections.length ? <ChannelGroup title="Telegram" id="telegram" connections={telegramConnections} /> : null}
          {otherConnections.length ? <ChannelGroup title="Other channels" id="other-channels" connections={otherConnections} /> : null}
        </div>
      )}

      {pendingAction ? (
        <div className="channels-progress" role="status" aria-live="polite">
          <Loader2 aria-hidden className="workspace-spin" size={15} /> Updating channel state…
        </div>
      ) : null}
    </>
  );
}

function ChannelGroup({ title, id, connections }: { title: string; id: string; connections: ReturnType<typeof useSalesOperatorChannels>["connections"] }) {
  return (
    <section className="channel-group" id={id} aria-labelledby={`${id}-title`}>
      <header><h2 id={`${id}-title`}>{title}</h2><span>{connections.length} connected {connections.length === 1 ? "account" : "accounts"}</span></header>
      <div className="channel-list">
        {connections.map((connection) => <ChannelConnectionCard key={connection.id} connection={connection} />)}
      </div>
    </section>
  );
}
