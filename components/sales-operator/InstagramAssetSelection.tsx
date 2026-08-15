"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Building2, Camera, Check, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { Alert, Button, EmptyState, ErrorDetails } from "@/components/account/ui";
import {
  INSTAGRAM_RETURN_PATH,
  parseInstagramCallback,
  safeProviderImageUrl,
} from "@/src/lib/sales-operator-channels";
import { useSalesOperatorChannels } from "@/src/providers/sales-operator-channels-provider";
import { useWorkspace } from "@/src/providers/workspace-provider";

export function InstagramAssetSelection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { workspace, status: workspaceStatus } = useWorkspace();
  const {
    canManage,
    instagramEnabled,
    pendingAction,
    instagramAuthorization,
    consumeInstagramCallback,
    clearInstagramAuthorization,
    confirmInstagramAssets,
    beginInstagramConnection,
  } = useSalesOperatorChannels();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [callbackError, setCallbackError] = useState<string | null>(null);
  const consumedRef = useRef<string | null>(null);

  useEffect(() => {
    if (workspaceStatus !== "ready" || !workspace) return;
    const metaStatus = searchParams.get("metaStatus");
    const authorizationSessionId = searchParams.get("authorizationSessionId");
    const flowWorkspaceId = searchParams.get("flowWorkspaceId");
    if (!metaStatus && !authorizationSessionId && !flowWorkspaceId && consumedRef.current) return;
    const parsed = parseInstagramCallback({
      metaStatus,
      authorizationSessionId,
      flowWorkspaceId,
    });
    const removeOAuthQuery = () => {
      if (window.location.pathname === INSTAGRAM_RETURN_PATH && window.location.search) {
        window.history.replaceState(window.history.state, "", INSTAGRAM_RETURN_PATH);
      }
    };
    router.replace(INSTAGRAM_RETURN_PATH, { scroll: false });
    removeOAuthQuery();
    window.requestAnimationFrame(removeOAuthQuery);
    window.setTimeout(removeOAuthQuery, 250);
    if (!parsed.ok) {
      setCallbackError("The Instagram return request was incomplete or unexpected. Start a new connection safely.");
      clearInstagramAuthorization();
      return;
    }
    if (consumedRef.current === parsed.authorizationSessionId) return;
    consumedRef.current = parsed.authorizationSessionId;
    setCallbackError(null);
    void consumeInstagramCallback({
      workspaceId: parsed.flowWorkspaceId,
      authorizationSessionId: parsed.authorizationSessionId,
    });
  }, [clearInstagramAuthorization, consumeInstagramCallback, router, searchParams, workspace, workspaceStatus]);

  useEffect(() => {
    setSelectedIds([]);
  }, [instagramAuthorization?.workspaceId, instagramAuthorization?.authorizationSessionId]);

  const assets = instagramAuthorization?.assets ?? [];
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const permissionDescriptionId = "instagram-confirm-permission";
  const canConfirm = canManage && instagramEnabled;

  async function restart() {
    clearInstagramAuthorization();
    setCallbackError(null);
    if (canConfirm) await beginInstagramConnection();
  }

  if (workspaceStatus === "loading" || workspaceStatus === "idle") {
    return <div className="instagram-assets-loading"><Loader2 aria-hidden className="workspace-spin" size={20} /> Restoring workspace…</div>;
  }

  return (
    <section className="instagram-assets" aria-labelledby="instagram-assets-title">
      <header className="instagram-assets__header">
        <span className="instagram-assets__icon"><Camera aria-hidden size={22} /></span>
        <div>
          <span>Instagram connection</span>
          <h1 id="instagram-assets-title">Choose business accounts</h1>
          <p>Select one or more eligible Instagram professional accounts for <strong>{workspace?.name ?? "this workspace"}</strong>. Automated replies will remain off.</p>
        </div>
      </header>

      <div className="instagram-assets__security">
        <ShieldCheck aria-hidden size={17} />
        <span>YDeck Cloud completed the Meta callback and keeps provider credentials server-side. This page receives only safe account fields.</span>
      </div>

      {callbackError ? (
        <EmptyState
          icon={<AlertCircle aria-hidden size={21} />}
          title="Instagram authorization could not continue"
          action={<Button type="button" disabled={!canConfirm} aria-describedby={!canConfirm ? permissionDescriptionId : undefined} onClick={() => void restart()}><RefreshCw aria-hidden size={15} /> Start again</Button>}
        >
          {callbackError}
          {!canConfirm ? (
            <span className="instagram-assets__permission" id={permissionDescriptionId} role="note">
              {!instagramEnabled
                ? "Instagram is not enabled for this workspace."
                : "Channel management permission is required to start again."}
            </span>
          ) : null}
        </EmptyState>
      ) : instagramAuthorization?.status === "loading" || !instagramAuthorization ? (
        <div className="instagram-assets-loading" role="status" aria-live="polite">
          <Loader2 aria-hidden className="workspace-spin" size={20} /> Loading eligible Instagram accounts…
        </div>
      ) : instagramAuthorization.status === "error" ? (
        <div className="instagram-assets__error">
          <Alert tone="danger" title={instagramAuthorization.error?.message ?? "Instagram accounts could not load"}>
            {instagramAuthorization.error?.remediation ?? "Start the Instagram connection again."}
          </Alert>
          {instagramAuthorization.error?.requestId ? (
            <ErrorDetails
              requestId={instagramAuthorization.error.requestId}
              category={instagramAuthorization.error.code.toLowerCase()}
              timestamp={new Date().toISOString()}
            />
          ) : null}
          {!canConfirm ? (
            <p className="instagram-assets__permission" id={permissionDescriptionId} role="note">
              {!instagramEnabled
                ? "Instagram is no longer enabled for this workspace. Start a new connection after the Cloud feature is restored."
                : "Your workspace access changed. Channel management permission is required to continue."}
            </p>
          ) : null}
          <Button type="button" disabled={!canConfirm} aria-describedby={!canConfirm ? permissionDescriptionId : undefined} onClick={() => void restart()}><RefreshCw aria-hidden size={15} /> Reconnect Instagram</Button>
        </div>
      ) : assets.length === 0 ? (
        <EmptyState
          icon={<Camera aria-hidden size={21} />}
          title="No eligible Instagram business accounts"
          action={<Button type="button" disabled={!canConfirm} aria-describedby={!canConfirm ? permissionDescriptionId : undefined} onClick={() => void restart()}><RefreshCw aria-hidden size={15} /> Start again</Button>}
        >
          No eligible Instagram business accounts were returned. Confirm that the Instagram account is professional, linked to the correct Meta business assets, and that the required permissions were approved.
          {!canConfirm ? (
            <span className="instagram-assets__permission" id={permissionDescriptionId} role="note">
              {!instagramEnabled
                ? "Instagram is no longer enabled for this workspace."
                : "Channel management permission is required to start again."}
            </span>
          ) : null}
        </EmptyState>
      ) : (
        <form className="instagram-assets__form" onSubmit={(event) => {
          event.preventDefault();
          void confirmInstagramAssets(selectedIds).then((confirmed) => {
            if (confirmed) router.replace("/sales-operator/channels");
          });
        }}>
          {instagramAuthorization.error ? (
            <div className="instagram-assets__confirm-error" role="alert">
              <Alert tone="danger" title={instagramAuthorization.error.message}>
                {instagramAuthorization.error.remediation}
              </Alert>
              {instagramAuthorization.error.requestId ? (
                <ErrorDetails
                  requestId={instagramAuthorization.error.requestId}
                  category={instagramAuthorization.error.code.toLowerCase()}
                  timestamp={new Date().toISOString()}
                />
              ) : null}
            </div>
          ) : null}
          <fieldset>
            <legend>{assets.length === 1 ? "Eligible account" : `${assets.length} eligible accounts`}</legend>
            <div className="instagram-asset-list">
              {assets.map((asset) => {
                const selected = selectedSet.has(asset.externalAccountId);
                const imageUrl = safeProviderImageUrl(asset.imageUrl);
                return (
                  <label className={`instagram-asset${selected ? " instagram-asset--selected" : ""}`} key={asset.externalAccountId}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(event) => setSelectedIds((current) => event.target.checked
                        ? [...new Set([...current, asset.externalAccountId])]
                        : current.filter((id) => id !== asset.externalAccountId))}
                    />
                    <span className="instagram-asset__check" aria-hidden>{selected ? <Check size={15} /> : null}</span>
                    <span className="instagram-asset__image">
                      {imageUrl ? <img src={imageUrl} alt="" referrerPolicy="no-referrer" /> : <Camera aria-hidden size={20} />}
                    </span>
                    <span className="instagram-asset__identity">
                      <strong title={asset.name}>{asset.name}</strong>
                      <small title={asset.username ?? undefined}>{asset.username ? `@${asset.username.replace(/^@/, "")}` : "Username unavailable"}</small>
                    </span>
                    <span className="instagram-asset__business" title={asset.linkedBusinessName ?? undefined}>
                      <Building2 aria-hidden size={15} /> {asset.linkedBusinessName ?? "Linked business not named"}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {!canConfirm ? (
            <p className="instagram-assets__permission" id={permissionDescriptionId} role="note">
              {!instagramEnabled
                ? "Instagram is no longer enabled for this workspace. Start a new connection after the Cloud feature is restored."
                : "Your workspace access changed. Channel management permission is required to confirm these accounts."}
            </p>
          ) : null}

          <div className="instagram-assets__actions">
            <Button type="button" variant="secondary" disabled={pendingAction === "instagram:confirm"} onClick={() => {
              clearInstagramAuthorization();
              router.replace("/sales-operator/channels");
            }}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={pendingAction === "instagram:confirm"}
              loadingLabel="Connecting accounts…"
              disabled={!canConfirm || selectedIds.length === 0 || Boolean(pendingAction)}
              aria-describedby={!canConfirm ? permissionDescriptionId : undefined}
            >
              Connect {selectedIds.length || "selected"} {selectedIds.length === 1 ? "account" : "accounts"}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
