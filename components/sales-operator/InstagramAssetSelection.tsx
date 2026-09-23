"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Building2, Camera, Check, CheckCircle2, ExternalLink, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { Alert, Button, EmptyState, ErrorDetails } from "@/components/account/ui";
import type { SalesChannelConnection } from "@/src/api/sales-operator";
import {
  INSTAGRAM_DESKTOP_CHANNELS_URL,
  captureInstagramCompletionContext,
  clearInstagramCompletionContext,
  isDesktopDeepLinkEnabled,
  isInstagramSessionExpiredCode,
  markInstagramConfirmationStarted,
  readInstagramCompletionContext,
  readInstagramConnectedReceipt,
  rememberConnectedInstagram,
  resolveConnectedInstagramChannel,
  type InstagramCompletionContext,
  type InstagramCompletionState,
} from "@/src/lib/instagram-oauth-completion";
import { INSTAGRAM_RETURN_PATH, safeProviderImageUrl } from "@/src/lib/sales-operator-channels";
import { useSalesOperatorChannels } from "@/src/providers/sales-operator-channels-provider";
import { useWorkspace } from "@/src/providers/workspace-provider";

function removeSensitiveQuery() {
  if (window.location.pathname === INSTAGRAM_RETURN_PATH && window.location.search) {
    window.history.replaceState(window.history.state, "", INSTAGRAM_RETURN_PATH);
  }
}

function InstagramProgress({ state }: { state: InstagramCompletionState }) {
  const label = state === "CONFIRMING"
    ? "Confirming connection…"
    : state === "VERIFYING_CHANNEL"
      ? "Checking connection…"
      : "Loading Instagram account…";
  return (
    <div className="instagram-assets-loading" role="status" aria-live="polite" data-state={state}>
      <Loader2 aria-hidden className="workspace-spin" size={20} /> {label}
    </div>
  );
}

function ConnectedExperience({ connection }: { connection: SalesChannelConnection }) {
  const desktopEnabled = isDesktopDeepLinkEnabled();
  const identity = connection.username
    ? `@${connection.username.replace(/^@/, "")}`
    : connection.accountName;
  return (
    <section className="instagram-completion" aria-labelledby="instagram-connected-title" data-state="CONNECTED">
      <span className="instagram-completion__icon instagram-completion__icon--success"><CheckCircle2 aria-hidden size={28} /></span>
      <p className="instagram-completion__brand">YDeck · Sales Operator</p>
      <h1 id="instagram-connected-title">Instagram connected</h1>
      <p><strong>{identity}</strong> is now connected to YDeck Sales Operator.</p>
      <p>New Instagram conversations can now be handled through YDeck.</p>
      <div className="instagram-completion__actions">
        {desktopEnabled ? (
          <a className="account-button account-button--primary" href={INSTAGRAM_DESKTOP_CHANNELS_URL}>
            Continue in YDeck <ExternalLink aria-hidden size={16} />
          </a>
        ) : (
          <Link className="account-button account-button--primary" href="/sales-operator/channels">
            View connected channels
          </Link>
        )}
      </div>
      <p className="instagram-completion__hint">
        {desktopEnabled
          ? "If YDeck doesn’t open, return to the YDeck Desktop app. You can also close this window."
          : "Return to the YDeck Desktop app when you’re ready. You can also close this window."}
      </p>
    </section>
  );
}

export function InstagramAssetSelection() {
  const searchParams = useSearchParams();
  const { workspace, status: workspaceStatus } = useWorkspace();
  const {
    status: channelsStatus,
    connections,
    canManage,
    instagramEnabled,
    pendingAction,
    instagramAuthorization,
    consumeInstagramCallback,
    clearInstagramAuthorization,
    confirmInstagramAssets,
    beginInstagramConnection,
  } = useSalesOperatorChannels();
  const [completionContext, setCompletionContext] = useState<InstagramCompletionContext | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [state, setState] = useState<InstagramCompletionState>("INITIALIZING");
  const [callbackError, setCallbackError] = useState<string | null>(null);
  const [connectedChannel, setConnectedChannel] = useState<SalesChannelConnection | null>(null);
  const consumedRef = useRef<string | null>(null);
  const submissionRef = useRef(false);

  useEffect(() => {
    const hasCallbackQuery = searchParams.has("metaStatus")
      || searchParams.has("authorizationSessionId")
      || searchParams.has("flowWorkspaceId");
    if (hasCallbackQuery) {
      const parsed = captureInstagramCompletionContext(new URLSearchParams(searchParams.toString()));
      removeSensitiveQuery();
      if (!parsed.ok) {
        clearInstagramCompletionContext();
        setCallbackError("The Instagram return request was incomplete or unexpected. Start a new connection from YDeck.");
        setState("ERROR");
        return;
      }
      setCompletionContext(parsed.context);
      return;
    }

    const stored = readInstagramCompletionContext();
    if (stored) {
      setCompletionContext(stored);
      return;
    }
    if (readInstagramConnectedReceipt()) return;
    setCallbackError("This Instagram connection request is no longer available. Start again from YDeck.");
    setState("EXPIRED");
  }, [searchParams]);

  useEffect(() => {
    if (!completionContext || state === "CONNECTED" || state === "ERROR" || state === "EXPIRED") return;
    const remaining = completionContext.expiresAt - Date.now();
    if (remaining <= 0) {
      clearInstagramCompletionContext();
      setState("EXPIRED");
      return;
    }
    const timeout = window.setTimeout(() => {
      clearInstagramCompletionContext();
      setState("EXPIRED");
    }, remaining);
    return () => window.clearTimeout(timeout);
  }, [completionContext, state]);

  useEffect(() => {
    if (workspaceStatus !== "ready" || !workspace || state === "ERROR" || state === "EXPIRED") return;
    const receipt = readInstagramConnectedReceipt();
    if (receipt?.workspaceId === workspace.id && channelsStatus === "ready") {
      const connected = resolveConnectedInstagramChannel(connections, receipt.externalAccountIds);
      if (connected) {
        clearInstagramCompletionContext();
        setConnectedChannel(connected);
        setState("CONNECTED");
        return;
      }
    }

    if (!completionContext) return;
    if (completionContext.flowWorkspaceId && completionContext.flowWorkspaceId !== workspace.id) {
      setCallbackError("This Instagram connection was started in a different YDeck workspace.");
      setState("ERROR");
      return;
    }
    if (completionContext.confirmationStarted && !submissionRef.current) {
      if (channelsStatus === "loading" || channelsStatus === "idle") {
        setState("VERIFYING_CHANNEL");
        return;
      }
      const connected = resolveConnectedInstagramChannel(connections, completionContext.selectedExternalAccountIds);
      if (connected) {
        rememberConnectedInstagram(workspace.id, [connected.externalAccountId]);
        setConnectedChannel(connected);
        setState("CONNECTED");
      } else if (channelsStatus === "ready" || channelsStatus === "error") {
        setCallbackError("YDeck could not verify a completed Instagram connection. Check your channels before starting again.");
        setState("ERROR");
      }
      return;
    }
    if (consumedRef.current === completionContext.authorizationSessionId) return;
    consumedRef.current = completionContext.authorizationSessionId;
    setState("LOADING_ASSETS");
    void consumeInstagramCallback({
      workspaceId: completionContext.flowWorkspaceId ?? workspace.id,
      authorizationSessionId: completionContext.authorizationSessionId,
    });
  }, [channelsStatus, completionContext, connections, consumeInstagramCallback, state, workspace, workspaceStatus]);

  const assets = instagramAuthorization?.assets ?? [];
  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.externalAccountId === selectedId) ?? null,
    [assets, selectedId],
  );
  const permissionDescriptionId = "instagram-confirm-permission";
  const canConfirm = canManage && instagramEnabled;

  useEffect(() => {
    if (instagramAuthorization?.status === "loading") setState("LOADING_ASSETS");
    if (instagramAuthorization?.status === "ready") {
      setSelectedId((current) => current || (instagramAuthorization.assets.length === 1
        ? instagramAuthorization.assets[0]?.externalAccountId ?? ""
        : ""));
      setState("ASSET_SELECTION");
    }
    if (instagramAuthorization?.status === "error") {
      setState(isInstagramSessionExpiredCode(instagramAuthorization.error?.code ?? "") ? "EXPIRED" : "ERROR");
    }
  }, [instagramAuthorization]);

  useEffect(() => {
    if (pendingAction === "instagram:confirm") setState("CONFIRMING");
    if (pendingAction === "instagram:verify") setState("VERIFYING_CHANNEL");
  }, [pendingAction]);

  async function restart() {
    clearInstagramCompletionContext();
    clearInstagramAuthorization();
    setCallbackError(null);
    if (canConfirm) await beginInstagramConnection();
  }

  async function confirmSelection() {
    if (!completionContext || !selectedAsset || submissionRef.current || pendingAction) return;
    submissionRef.current = true;
    setState("CONFIRMING");
    const submittedContext = markInstagramConfirmationStarted(completionContext, [selectedAsset.externalAccountId]);
    setCompletionContext(submittedContext);
    const connected = await confirmInstagramAssets([selectedAsset.externalAccountId]);
    if (connected && workspace) {
      rememberConnectedInstagram(workspace.id, [connected.externalAccountId]);
      setConnectedChannel(connected);
      setState("CONNECTED");
      return;
    }
    const errorCode = instagramAuthorization?.error?.code ?? "";
    setState(isInstagramSessionExpiredCode(errorCode) ? "EXPIRED" : "ERROR");
  }

  if (connectedChannel) return <ConnectedExperience connection={connectedChannel} />;

  if (workspaceStatus === "loading" || workspaceStatus === "idle" || state === "INITIALIZING") {
    return <InstagramProgress state="INITIALIZING" />;
  }

  if (["LOADING_ASSETS", "CONFIRMING", "VERIFYING_CHANNEL"].includes(state)) {
    return <InstagramProgress state={state} />;
  }

  const safeError = instagramAuthorization?.error;
  if (state === "ERROR" || state === "EXPIRED") {
    const expired = state === "EXPIRED";
    return (
      <section className="instagram-assets" aria-labelledby="instagram-assets-title" data-state={state}>
        <EmptyState
          icon={<AlertCircle aria-hidden size={21} />}
          title={expired ? "Instagram session expired" : "Instagram connection could not continue"}
          action={canConfirm ? <Button type="button" onClick={() => void restart()}><RefreshCw aria-hidden size={15} /> Start again from YDeck</Button> : undefined}
        >
          {expired
            ? "This secure completion session has expired. Start a new Instagram connection from YDeck."
            : callbackError ?? safeError?.message ?? "YDeck could not finish connecting Instagram."}
          {safeError?.remediation && !expired ? <span className="instagram-assets__permission">{safeError.remediation}</span> : null}
        </EmptyState>
        {safeError?.requestId ? (
          <ErrorDetails requestId={safeError.requestId} category={safeError.code.toLowerCase()} timestamp={new Date().toISOString()} />
        ) : null}
      </section>
    );
  }

  return (
    <section className="instagram-assets" aria-labelledby="instagram-assets-title" data-state="ASSET_SELECTION">
      <header className="instagram-assets__header">
        <span className="instagram-assets__icon"><Camera aria-hidden size={22} /></span>
        <div>
          <span>Instagram connection</span>
          <h1 id="instagram-assets-title">{assets.length === 1 ? "Confirm Instagram account" : "Choose an Instagram account"}</h1>
          <p>Connect an eligible Instagram Professional account to <strong>{workspace?.name ?? "this workspace"}</strong>. Automated replies will remain off.</p>
        </div>
      </header>

      <div className="instagram-assets__security">
        <ShieldCheck aria-hidden size={17} />
        <span>YDeck Cloud keeps provider credentials server-side. Only safe account details are shown here.</span>
      </div>

      {assets.length === 0 ? (
        <EmptyState
          icon={<Camera aria-hidden size={21} />}
          title="No eligible Instagram Professional account"
          action={<Button type="button" disabled={!canConfirm} onClick={() => void restart()}><RefreshCw aria-hidden size={15} /> Start again</Button>}
        >
          We couldn’t find an eligible Instagram Professional account. Confirm the account type and required permissions, then try again from YDeck.
        </EmptyState>
      ) : (
        <form className="instagram-assets__form" onSubmit={(event) => { event.preventDefault(); void confirmSelection(); }}>
          {safeError ? <Alert tone="danger" title={safeError.message}>{safeError.remediation}</Alert> : null}
          <fieldset>
            <legend>{assets.length === 1 ? "Instagram account" : `${assets.length} eligible accounts`}</legend>
            <div className="instagram-asset-list">
              {assets.map((asset) => {
                const selected = selectedId === asset.externalAccountId;
                const imageUrl = safeProviderImageUrl(asset.imageUrl);
                return (
                  <label className={`instagram-asset${selected ? " instagram-asset--selected" : ""}`} key={asset.externalAccountId}>
                    <input type="radio" name="instagram-account" checked={selected} onChange={() => setSelectedId(asset.externalAccountId)} />
                    <span className="instagram-asset__check" aria-hidden>{selected ? <Check size={15} /> : null}</span>
                    <span className="instagram-asset__image">
                      {imageUrl ? <img src={imageUrl} alt="" referrerPolicy="no-referrer" /> : <Camera aria-hidden size={20} />}
                    </span>
                    <span className="instagram-asset__identity">
                      <strong title={asset.username ?? asset.name}>{asset.username ? `@${asset.username.replace(/^@/, "")}` : asset.name}</strong>
                      <small title={asset.name}>{asset.name}</small>
                    </span>
                    <span className="instagram-asset__business" title={asset.linkedBusinessName ?? undefined}>
                      <Building2 aria-hidden size={15} /> {asset.linkedBusinessName ?? "Professional account"}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {!canConfirm ? (
            <p className="instagram-assets__permission" id={permissionDescriptionId} role="note">
              {!instagramEnabled ? "Instagram is not enabled for this workspace." : "Channel management permission is required to continue."}
            </p>
          ) : null}

          <div className="instagram-assets__actions">
            <Link className="account-button account-button--secondary" href="/sales-operator/channels" onClick={clearInstagramCompletionContext}>Cancel</Link>
            <Button
              type="submit"
              loading={pendingAction === "instagram:confirm" || pendingAction === "instagram:verify"}
              loadingLabel={pendingAction === "instagram:verify" ? "Checking connection…" : "Connecting Instagram…"}
              disabled={!canConfirm || !selectedId || Boolean(pendingAction) || submissionRef.current}
              aria-describedby={!canConfirm ? permissionDescriptionId : undefined}
            >
              {assets.length === 1 ? "Connect Instagram" : "Connect selected account"}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
