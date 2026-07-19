"use client";

import { useEffect, useState } from "react";
import { Monitor } from "lucide-react";
import { Alert, Button, ConfirmationDialog, DangerZone, EmptyState, ErrorDetails, Panel, SettingsHeader, SkeletonBlock, StatusBadge, TextInput } from "@/components/account/ui";
import { getHumanErrorMessage } from "@/src/api/client";
import type { AccountDesktopDevice } from "@/src/api/types";
import { formatDateTime } from "@/src/lib/format";
import { formatPairingCodeInput, isCompletePairingCode, isPairingFailureDecision } from "@/src/lib/desktop-pairing";
import { useAuth } from "@/src/providers/auth-provider";
import { useDevices } from "@/src/providers/device-provider";

export default function DevicesPage() {
  const { user, signOut } = useAuth();
  const { devices, status, error, approveCode, denyCode, resetPairingDecision, revokeDevice, revokeAll, pairingDecision, refreshDevices } =
    useDevices();
  const [userCode, setUserCode] = useState("");
  const [reason, setReason] = useState("");
  const [revokeAllConfirmation, setRevokeAllConfirmation] = useState("");
  const [pairingAction, setPairingAction] = useState<"approve" | "deny" | null>(null);
  const [pendingDeviceId, setPendingDeviceId] = useState<string | null>(null);
  const [deviceToRevoke, setDeviceToRevoke] = useState<AccountDesktopDevice | null>(null);
  const [pendingRevokeAll, setPendingRevokeAll] = useState(false);
  const [revokeAllDialogOpen, setRevokeAllDialogOpen] = useState(false);
  const [refreshingDevices, setRefreshingDevices] = useState(false);
  const [switchingAccount, setSwitchingAccount] = useState(false);
  const [pairingOpen, setPairingOpen] = useState(false);
  const [retrySeconds, setRetrySeconds] = useState(0);
  const [feedback, setFeedback] = useState<{ tone: "success" | "danger"; message: string } | null>(null);
  const pairingBusy = pairingAction !== null;
  const codeComplete = isCompletePairingCode(userCode);
  const pairingFailure = isPairingFailureDecision(pairingDecision) ? pairingDecision : null;
  const reasonValid = reason.length === 0 || (reason.trim().length >= 3 && reason.trim().length <= 500);
  const hasRevocableDevices = devices.some((device) => device.status !== "revoked");

  useEffect(() => {
    const handleFocus = () => {
      void refreshDevices().catch(() => undefined);
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshDevices]);

  useEffect(() => {
    if (pairingDecision.status !== "rate_limited" || !pairingDecision.retryAt) {
      setRetrySeconds(0);
      return;
    }
    const updateCountdown = () => {
      setRetrySeconds(Math.max(0, Math.ceil((pairingDecision.retryAt! - Date.now()) / 1000)));
    };
    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, [pairingDecision]);

  async function handleApprove(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPairingAction("approve");
    setFeedback(null);
    try {
      const decision = await approveCode(userCode);
      if (["approved", "expired", "already_used"].includes(decision.status)) {
        setUserCode("");
      }
    } finally {
      setPairingAction(null);
    }
  }

  async function handleDeny() {
    setPairingAction("deny");
    setFeedback(null);
    try {
      const decision = await denyCode(userCode);
      if (["denied", "expired", "already_used"].includes(decision.status)) {
        setUserCode("");
      }
    } finally {
      setPairingAction(null);
    }
  }

  async function handleDeviceRevoke() {
    if (!deviceToRevoke) return false;
    setPendingDeviceId(deviceToRevoke.id);
    setFeedback(null);
    try {
      await revokeDevice(deviceToRevoke.id);
      setFeedback({ tone: "success", message: "Desktop access was revoked for that device." });
      return true;
    } catch (error) {
      setFeedback({ tone: "danger", message: getHumanErrorMessage(error) });
      return false;
    } finally {
      setPendingDeviceId(null);
    }
  }

  async function handleRevokeAll() {
    setPendingRevokeAll(true);
    setFeedback(null);
    try {
      const result = await revokeAll(reason.trim() || undefined);
      setFeedback({
        tone: "success",
        message: `Revoked ${result.revokedDevices} Desktop ${result.revokedDevices === 1 ? "device" : "devices"} and ${result.revokedSessions} active ${result.revokedSessions === 1 ? "session" : "sessions"}.`,
      });
      setReason("");
      setRevokeAllConfirmation("");
      return true;
    } catch (error) {
      setFeedback({ tone: "danger", message: getHumanErrorMessage(error) });
      return false;
    } finally {
      setPendingRevokeAll(false);
    }
  }

  async function handleRefreshDevices() {
    setRefreshingDevices(true);
    setFeedback(null);
    try {
      await refreshDevices();
    } catch (error) {
      setFeedback({ tone: "danger", message: getHumanErrorMessage(error) });
    } finally {
      setRefreshingDevices(false);
    }
  }

  async function handleSwitchAccount() {
    const returnTo = userCode ? `/desktop/pairing?user_code=${encodeURIComponent(userCode)}` : "/desktop/pairing";
    setSwitchingAccount(true);
    try {
      await signOut(returnTo);
    } finally {
      setSwitchingAccount(false);
    }
  }

  return (
    <>
      <SettingsHeader
        title="Devices"
        description="Connect YDeck Desktop, review trusted devices, and revoke access when needed."
        scope="Desktop"
        action={
          <Button
            variant="secondary"
            type="button"
            loading={refreshingDevices}
            disabled={pendingRevokeAll || pendingDeviceId !== null}
            onClick={() => void handleRefreshDevices()}
          >
            Refresh devices
          </Button>
        }
      />
      {feedback ? <Alert tone={feedback.tone}>{feedback.message}</Alert> : null}
      <Panel
        title="Pair YDeck Desktop"
        description="Pairing starts in YDeck Desktop and uses a short-lived code."
        className="account-panel--feature device-pairing-panel"
        action={!pairingOpen ? (
          <Button type="button" onClick={() => setPairingOpen(true)}>Enter pairing code</Button>
        ) : undefined}
      >
        <ol className="pairing-steps pairing-steps--compact">
          <li>
            <span>1</span>
            <div>
              <strong>Start in YDeck Desktop</strong>
              <small>Choose Connect Account to create a short-lived pairing code.</small>
            </div>
          </li>
          <li>
            <span>2</span>
            <div>
              <strong>Enter the matching code</strong>
              <small>Confirm that every character matches the code shown in Desktop.</small>
            </div>
          </li>
          <li>
            <span>3</span>
            <div>
              <strong>Approve and return</strong>
              <small>Desktop completes the secure exchange and appears in your device list.</small>
            </div>
          </li>
        </ol>
        {!pairingOpen ? (
          <div className="pairing-idle-state">
            <strong>No pairing request is open in this browser.</strong>
            <span>Start Connect Account in YDeck Desktop, then enter the code here. Approve only a request you initiated.</span>
          </div>
        ) : null}
        {pairingOpen ? <Alert tone="info">Device details appear after approval. Confirm only a code you started in YDeck Desktop.</Alert> : null}
        {pairingDecision.status === "approved" ? (
          <Alert tone="success" title="Pairing approved">
            {`Approval was recorded for ${pairingDecision.response.device.name ?? "YDeck Desktop"} on ${pairingDecision.response.device.platform}. Return to Desktop to finish the secure exchange; the device is not connected yet.`}
          </Alert>
        ) : null}
        {pairingDecision.status === "denied" ? <Alert tone="warning" title="Pairing denied">Start a new request from YDeck Desktop if you want to try again.</Alert> : null}
        {pairingFailure ? (
          <div className="pairing-decision-error">
            <Alert tone={pairingFailure.status === "rate_limited" ? "warning" : "danger"}>
              {pairingFailure.status === "rate_limited" && retrySeconds > 0
                ? `${pairingFailure.message} Try again in ${retrySeconds} seconds.`
                : pairingFailure.message}
            </Alert>
            {pairingFailure.requestId ? (
              <ErrorDetails requestId={pairingFailure.requestId} category="desktop_pairing" timestamp={new Date().toISOString()} />
            ) : null}
          </div>
        ) : null}
        {pairingOpen ? <div className="pairing-account-inline">
          <span><small>Approving as</small><strong>{user?.displayName || user?.primaryEmail || "YDeck account"}</strong></span>
          <Button variant="ghost" type="button" loading={switchingAccount} disabled={pairingBusy} onClick={() => void handleSwitchAccount()}>
            Switch account
          </Button>
        </div> : null}
        {pairingOpen ? <form className="account-form pairing-form" onSubmit={(event) => void handleApprove(event)}>
          <TextInput
            label="Pairing code"
            value={userCode}
            onChange={(event) => {
              setUserCode(formatPairingCodeInput(event.target.value));
              resetPairingDecision();
            }}
            hint="This request expires soon. Enter only the code shown in YDeck Desktop."
            autoComplete="one-time-code"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={13}
            className="pairing-code-input"
          />
          <div className="account-actions">
            <Button loading={pairingAction === "approve"} loadingLabel="Recording approval…" type="submit" disabled={!codeComplete || pairingBusy || retrySeconds > 0}>
              Approve pairing
            </Button>
            <Button
              variant="secondary"
              loading={pairingAction === "deny"}
              loadingLabel="Recording denial…"
              type="button"
              onClick={() => void handleDeny()}
              disabled={!codeComplete || pairingBusy || retrySeconds > 0}
            >
              Deny pairing
            </Button>
            <Button variant="ghost" type="button" disabled={pairingBusy} onClick={() => {
              setPairingOpen(false);
              setUserCode("");
              resetPairingDecision();
            }}>
              Cancel
            </Button>
          </div>
        </form> : null}
      </Panel>

      <Panel
        title="Connected devices"
        description="Review Desktop devices that can access this YDeck account."
      >
        {error ? <Alert tone="danger">{error}</Alert> : null}
        {status === "loading" ? (
          <SkeletonBlock rows={4} />
        ) : status === "error" ? (
          <EmptyState
            icon={<Monitor aria-hidden size={20} />}
            title="Connected devices unavailable"
            action={
              <Button type="button" variant="secondary" loading={refreshingDevices} onClick={() => void handleRefreshDevices()}>
                Try again
              </Button>
            }
          >
            YDeck could not load the trusted device list. Existing device access has not been changed.
          </EmptyState>
        ) : devices.length === 0 ? (
          <EmptyState
            icon={<Monitor aria-hidden size={20} />}
            title="No desktop devices connected"
            action={<Button type="button" onClick={() => setPairingOpen(true)}>Pair a device</Button>}
          >
            Start pairing from YDeck Desktop and approve the request here to connect your first device.
          </EmptyState>
        ) : (
          <div className="account-table">
            {devices.map((device) => (
              <div className="account-table-row device-row" key={device.id}>
                <div className="device-row__identity">
                  <span className="device-row__icon" aria-hidden>
                    <Monitor size={19} />
                  </span>
                  <div>
                    <strong>{device.name ?? "Unnamed Desktop device"}</strong>
                    <small>
                      {[device.platform, device.architecture].filter(Boolean).join(" · ") || "Platform details unavailable"}
                      {device.firstSeenAt ? ` · Connected ${formatDateTime(device.firstSeenAt)}` : ""}
                    </small>
                  </div>
                </div>
                <dl className="device-row__facts">
                  <div><dt>Software</dt><dd>{device.appVersion ? `${device.appVersion}${device.appBuild ? ` (${device.appBuild})` : ""}` : "Version unavailable"}<small>{device.releaseChannel ?? "Channel unavailable"}</small></dd></div>
                  <div><dt>Activity</dt><dd>{formatDateTime(device.lastSeenAt ?? device.firstSeenAt ?? null)}<small>Last reported</small></dd></div>
                  <div>
                    <dt>Trust</dt>
                    <dd>
                      {device.trustLevel?.replaceAll("_", " ") ?? "Standard"}
                      <small>
                        {device.status === "revoked" && device.revokeReason
                          ? `Revoked: ${device.revokeReason.replaceAll("_", " ")}`
                          : device.approvedAt
                            ? `Approved ${formatDateTime(device.approvedAt)}`
                            : "Approval time unavailable"}
                      </small>
                    </dd>
                  </div>
                </dl>
                <div className="device-row__actions">
                  {device.current ? <StatusBadge tone="current">Current</StatusBadge> : null}
                  {device.trustLevel && device.trustLevel !== "standard" ? (
                    <StatusBadge tone={device.trustLevel === "blocked" ? "danger" : "warning"}>{device.trustLevel.replaceAll("_", " ")}</StatusBadge>
                  ) : null}
                  <StatusBadge tone={device.status === "active" ? "success" : device.status ?? "neutral"}>{device.status ?? "Connected"}</StatusBadge>
                  {device.status !== "revoked" ? (
                    <Button
                      variant="secondary"
                      type="button"
                      loading={pendingDeviceId === device.id}
                      disabled={pendingDeviceId !== null || pendingRevokeAll || refreshingDevices}
                      onClick={() => setDeviceToRevoke(device)}
                    >
                      Revoke access
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {hasRevocableDevices ? <DangerZone
        title="Revoke all Desktop devices"
        description="Use this if you are rotating access or no longer trust connected Desktop installations."
      >
        <div className="account-actions">
          <Button variant="danger" type="button" onClick={() => setRevokeAllDialogOpen(true)} disabled={refreshingDevices}>
            Revoke all
          </Button>
        </div>
      </DangerZone> : null}
      <ConfirmationDialog
        open={revokeAllDialogOpen}
        title="Revoke all Desktop devices?"
        description="All Desktop installations and their Cloud sessions will lose access. This browser remains signed in, and local presentation files are not deleted."
        confirmLabel="Revoke all"
        loading={pendingRevokeAll}
        disabled={revokeAllConfirmation !== "REVOKE" || !reasonValid}
        onCancel={() => {
          setRevokeAllDialogOpen(false);
          setRevokeAllConfirmation("");
          setReason("");
        }}
        onConfirm={() => {
          void (async () => {
            const revoked = await handleRevokeAll();
            if (revoked) {
              setRevokeAllDialogOpen(false);
            }
          })();
        }}
      >
        <div className="account-form">
          <TextInput
            label="Type REVOKE to continue"
            value={revokeAllConfirmation}
            onChange={(event) => setRevokeAllConfirmation(event.target.value.toUpperCase())}
            autoComplete="off"
          />
          <TextInput
            label="Reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Optional"
            maxLength={500}
            hint="If provided, use 3 to 500 characters. This may appear in security records."
            error={reasonValid ? null : "Use at least 3 characters or leave the reason empty."}
          />
        </div>
      </ConfirmationDialog>
      <ConfirmationDialog
        open={deviceToRevoke !== null}
        title="Revoke Desktop access?"
        description={`${deviceToRevoke?.name ?? "This Desktop device"} will immediately lose YDeck Cloud access and its active Desktop sessions. Local presentation files will not be deleted.`}
        confirmLabel="Revoke access"
        loading={pendingDeviceId === deviceToRevoke?.id}
        onCancel={() => setDeviceToRevoke(null)}
        onConfirm={() => {
          void (async () => {
            const revoked = await handleDeviceRevoke();
            if (revoked) setDeviceToRevoke(null);
          })();
        }}
      />
    </>
  );
}
