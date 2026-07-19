"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Alert, AuthShell, Button, ErrorDetails, TextInput } from "@/components/account/ui";
import { formatPairingCodeInput, isCompletePairingCode, isPairingFailureDecision, type PairingDecision } from "@/src/lib/desktop-pairing";
import { authReturnToParam } from "@/src/lib/auth-return";
import { useAuth } from "@/src/providers/auth-provider";
import { useDevices } from "@/src/providers/device-provider";

function pairingFailureTitle(status: PairingDecision["status"]) {
  switch (status) {
    case "expired":
      return "Pairing request expired";
    case "already_used":
      return "Pairing request already decided";
    case "not_found":
      return "Pairing request not found";
    case "rate_limited":
      return "Too many pairing attempts";
    case "invalid_code":
      return "Check the pairing code";
    default:
      return "Unable to record this decision";
  }
}

export default function DesktopPairingClient() {
  const router = useRouter();
  const params = useSearchParams();
  const initialCode = useMemo(
    () => formatPairingCodeInput(params.get("userCode") ?? params.get("user_code") ?? ""),
    [params],
  );
  const { status: authStatus, user, error: authError, refreshSession, signOut } = useAuth();
  const { approveCode, denyCode, pairingDecision, resetPairingDecision } = useDevices();
  const [userCode, setUserCode] = useState(initialCode);
  const [busyAction, setBusyAction] = useState<"approve" | "deny" | "switch" | null>(null);
  const [retrySeconds, setRetrySeconds] = useState(0);
  const busy = busyAction !== null;
  const codeComplete = isCompletePairingCode(userCode);
  const terminal = ["approved", "denied", "expired", "already_used"].includes(pairingDecision.status);
  const pairingFailure = isPairingFailureDecision(pairingDecision) ? pairingDecision : null;
  const pairingReturnTo = userCode ? `/desktop/pairing?user_code=${encodeURIComponent(userCode)}` : "/desktop/pairing";

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

  function clearPairingLocation() {
    setUserCode("");
    router.replace("/desktop/pairing");
  }

  async function handleApprove(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyAction("approve");
    try {
      const decision = await approveCode(userCode);
      if (["approved", "expired", "already_used"].includes(decision.status)) {
        clearPairingLocation();
      }
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDeny() {
    setBusyAction("deny");
    try {
      const decision = await denyCode(userCode);
      if (["denied", "expired", "already_used"].includes(decision.status)) {
        clearPairingLocation();
      }
    } finally {
      setBusyAction(null);
    }
  }

  async function handleSwitchAccount() {
    setBusyAction("switch");
    try {
      await signOut(pairingReturnTo);
    } finally {
      setBusyAction(null);
    }
  }

  if (authStatus === "loading") {
    return <main className="account-page account-page--center"><div className="account-skeleton-card" aria-label="Restoring account session" /></main>;
  }

  if (authStatus !== "authenticated") {
    return (
      <AuthShell
        title="Sign in to connect YDeck Desktop"
        subtitle="Sign in or create an account first. After authentication, YDeck will return you to this pairing request."
        footer={<div>You can safely return to YDeck Desktop without approving this request.</div>}
      >
        {authError ? (
          <Alert tone="warning" title="Browser session could not be restored">
            {authError}
          </Alert>
        ) : null}
        <Alert tone="info" title="Authentication required">
          Approval controls remain unavailable until a Web account is authenticated.
        </Alert>
        <div className="auth-actions auth-links pairing-auth-actions">
          <Link className="account-button account-button--primary" href={`/auth/sign-in${authReturnToParam(pairingReturnTo)}`}>
            Sign in
          </Link>
          <Link className="account-button account-button--secondary" href={`/auth/sign-up${authReturnToParam(pairingReturnTo)}`}>
            Sign up
          </Link>
          {authError ? (
            <Button variant="ghost" type="button" onClick={() => void refreshSession()}>
              Retry session
            </Button>
          ) : null}
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Allow this Desktop app to connect to your YDeck account?"
      subtitle="Confirm that the code below matches the code currently shown in YDeck Desktop."
      footer={
        <div>
          Manage existing access in <Link href="/settings/devices">Connected devices</Link>
        </div>
      }
    >
      <section className="pairing-account-summary" aria-label="Account receiving Desktop access">
        <span className="pairing-account-summary__avatar" aria-hidden>
          {(user?.displayName || user?.primaryEmail || "Y").charAt(0).toUpperCase()}
        </span>
        <span>
          <small>Connecting to</small>
          <strong>{user?.displayName || user?.primaryEmail || "YDeck account"}</strong>
          {user?.displayName && user.primaryEmail ? <span>{user.primaryEmail}</span> : null}
        </span>
        <Button variant="ghost" type="button" loading={busyAction === "switch"} disabled={busy} onClick={() => void handleSwitchAccount()}>
          Switch account
        </Button>
      </section>

      {pairingDecision.status === "approved" ? (
        <Alert tone="success" title="Desktop pairing approved">
          You can return to YDeck Desktop.
        </Alert>
      ) : null}
      {pairingDecision.status === "denied" ? (
        <Alert tone="warning" title="Desktop pairing denied">Pairing was denied. You can close this tab.</Alert>
      ) : null}
      {pairingFailure ? (
        <div className="pairing-decision-error">
          <Alert tone={pairingFailure.status === "rate_limited" ? "warning" : "danger"} title={pairingFailureTitle(pairingFailure.status)}>
            {pairingFailure.status === "rate_limited" && retrySeconds > 0
              ? `${pairingFailure.message} Try again in ${retrySeconds} seconds.`
              : pairingFailure.message}
          </Alert>
          {pairingFailure.requestId ? (
            <ErrorDetails requestId={pairingFailure.requestId} category="desktop_pairing" timestamp={new Date().toISOString()} />
          ) : null}
        </div>
      ) : null}

      {!terminal ? (
        <form className="auth-form pairing-confirmation-form" onSubmit={(event) => void handleApprove(event)}>
          <TextInput
            label="Confirmation code"
            value={userCode}
            onChange={(event) => {
              setUserCode(formatPairingCodeInput(event.target.value));
              resetPairingDecision();
            }}
            hint="This request expires soon. If it expires, restart pairing from YDeck Desktop."
            autoComplete="one-time-code"
            autoCapitalize="characters"
            spellCheck={false}
            inputMode="text"
            maxLength={13}
          />
          <div className="auth-actions pairing-confirmation-actions">
            <Button loading={busyAction === "approve"} loadingLabel="Recording approval…" type="submit" disabled={!codeComplete || busy || retrySeconds > 0}>
              Allow
            </Button>
            <Button
              variant="danger"
              loading={busyAction === "deny"}
              loadingLabel="Recording denial…"
              type="button"
              onClick={() => void handleDeny()}
              disabled={!codeComplete || busy || retrySeconds > 0}
            >
              Deny
            </Button>
          </div>
        </form>
      ) : (
        <div className="auth-actions">
          <Link className="account-button account-button--secondary" href="/settings/devices">Review connected devices</Link>
        </div>
      )}
    </AuthShell>
  );
}
