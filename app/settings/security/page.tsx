"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { Activity, AtSign, Eye, EyeOff, KeyRound, Laptop, MonitorSmartphone, ShieldCheck } from "lucide-react";
import {
  Alert,
  Button,
  ConfirmationDialog,
  DangerZone,
  EmptyState,
  Panel,
  SettingsHeader,
  SkeletonBlock,
  StatusBadge,
  TextInput,
} from "@/components/account/ui";
import { changePassword, logoutAll, setAccountPassword } from "@/src/api/auth";
import { getHumanErrorMessage } from "@/src/api/client";
import { formatDateTime } from "@/src/lib/format";
import { useAccount } from "@/src/providers/account-provider";
import { useAuth } from "@/src/providers/auth-provider";

function PasswordVisibilityButton({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  const Icon = visible ? EyeOff : Eye;
  const label = visible ? "Hide passwords" : "Show passwords";

  return (
    <button className="account-field__toggle" type="button" aria-label={label} title={label} onClick={onToggle}>
      <Icon aria-hidden size={17} />
    </button>
  );
}

function SecuritySignal({
  icon,
  label,
  value,
  detail,
  tone = "neutral",
  action,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  tone?: "neutral" | "success" | "warning";
  action?: ReactNode;
}) {
  return (
    <article className="security-signal" data-tone={tone}>
      <span className="security-signal__icon" aria-hidden>{icon}</span>
      <div className="security-signal__body">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
      {action ? <div className="security-signal__action">{action}</div> : null}
    </article>
  );
}

export default function SecurityPage() {
  const router = useRouter();
  const {
    security,
    sessions,
    securityStatus,
    sessionsStatus,
    securityError,
    sessionsError,
    refreshAccount,
    revokeSession,
    revokeOtherSessions,
  } = useAccount();
  const { clearSessionState, user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [revokeOthersDialogOpen, setRevokeOthersDialogOpen] = useState(false);
  const [busyAction, setBusyAction] = useState<"password" | "logout-all" | "revoke-others" | null>(null);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "danger"; message: string } | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const busy = busyAction !== null || pendingSessionId !== null;
  const recentSecurityActivity = [
    security?.passwordChangedAt ? { label: "Password changed", at: security.passwordChangedAt } : null,
    security?.emailChangedAt ? { label: "Email changed", at: security.emailChangedAt } : null,
  ]
    .filter((item): item is { label: string; at: string } => item !== null)
    .sort((first, second) => new Date(second.at).getTime() - new Date(first.at).getTime())[0];
  const emailVerified = security?.emailVerified === true;
  const passwordConfigured = security?.passwordConfigured === true;
  const recommendedStepCount = Number(!emailVerified) + Number(!passwordConfigured);
  const needsAttention = securityStatus === "ready" && recommendedStepCount > 0;
  const activeSessionCount = sessionsStatus === "ready" ? sessions.length : security?.activeSessionCount ?? 0;
  const visibleSessions = showAllSessions ? sessions : sessions.slice(0, 5);
  const otherSessionCount = sessions.filter((session) => !session.current).length;

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);
    if (newPassword.length < 10) {
      setPasswordError("Use at least 10 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("The confirmation password does not match.");
      return;
    }
    setBusyAction("password");
    setFeedback(null);
    try {
      if (passwordConfigured) {
        await changePassword({ currentPassword, newPassword });
      } else {
        await setAccountPassword({ newPassword });
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await refreshAccount();
      setFeedback({ tone: "success", message: "Your password was updated. Other sessions may need to sign in again." });
    } catch (submitError) {
      setFeedback({ tone: "danger", message: getHumanErrorMessage(submitError) });
    } finally {
      setBusyAction(null);
    }
  }

  async function handleLogoutAll() {
    setBusyAction("logout-all");
    setFeedback(null);
    try {
      await logoutAll();
      clearSessionState();
      setLogoutDialogOpen(false);
      router.push("/auth/sign-in");
    } catch (logoutError) {
      setFeedback({ tone: "danger", message: getHumanErrorMessage(logoutError) });
    } finally {
      setBusyAction(null);
    }
  }

  async function handleRevokeSession(sessionId: string) {
    setPendingSessionId(sessionId);
    setFeedback(null);
    try {
      await revokeSession(sessionId);
      setFeedback({ tone: "success", message: "The session was revoked." });
    } catch (revokeError) {
      setFeedback({ tone: "danger", message: getHumanErrorMessage(revokeError) });
    } finally {
      setPendingSessionId(null);
    }
  }

  async function handleRevokeOthers() {
    setBusyAction("revoke-others");
    setFeedback(null);
    try {
      await revokeOtherSessions();
      setRevokeOthersDialogOpen(false);
      setFeedback({ tone: "success", message: "All other browser sessions were revoked. This session remains active." });
    } catch (revokeError) {
      setFeedback({ tone: "danger", message: getHumanErrorMessage(revokeError) });
    } finally {
      setBusyAction(null);
    }
  }

  const passwordToggle = (
    <PasswordVisibilityButton visible={showPasswords} onToggle={() => setShowPasswords((visible) => !visible)} />
  );

  return (
    <div className="security-page">
      <SettingsHeader
        title="Security"
        description="Manage sign-in protection and review where your account is active."
        scope="Personal"
        action={securityStatus === "ready" ? (
          <span className={`security-health ${needsAttention ? "security-health--attention" : "security-health--secure"}`}>
            <span aria-hidden />
            {needsAttention
              ? `${recommendedStepCount} ${recommendedStepCount === 1 ? "step" : "steps"} recommended`
              : "Protection active"}
          </span>
        ) : undefined}
      />

      {feedback ? <Alert tone={feedback.tone}>{feedback.message}</Alert> : null}

      {securityStatus === "loading" || securityStatus === "idle" ? (
        <section className="security-posture" aria-label="Loading security overview">
          <SkeletonBlock rows={3} />
        </section>
      ) : securityStatus === "error" ? (
        <section className="security-posture security-posture--error">
          <Alert tone="danger">{securityError ?? "Security details could not be loaded."}</Alert>
          <Button type="button" variant="secondary" onClick={() => void refreshAccount()}>
            Retry security check
          </Button>
        </section>
      ) : (
        <section
          className={`security-posture ${needsAttention ? "security-posture--attention" : "security-posture--secure"}`}
          aria-labelledby="security-posture-title"
        >
          <div className="security-posture__lead">
            <span className="security-posture__mark" aria-hidden><ShieldCheck size={22} /></span>
            <div>
              <h2 id="security-posture-title">{needsAttention ? "Complete your account protection" : "Your account protection is up to date"}</h2>
              <p>
                {needsAttention
                  ? "Finish the recommended steps to strengthen account recovery and protect future Desktop connections."
                  : "Your recovery email and password are configured. Review active sessions periodically."}
              </p>
            </div>
          </div>

          <div className="security-posture__signals">
            <SecuritySignal
              label="Email"
              value={emailVerified ? "Verified" : "Verification needed"}
              tone={emailVerified ? "success" : "warning"}
              icon={<AtSign size={18} />}
              detail={emailVerified ? "Available for secure account recovery." : "Verify this address before relying on recovery."}
              action={
                !emailVerified && user?.primaryEmail ? (
                  <Link href={`/auth/resend-verification?email=${encodeURIComponent(user.primaryEmail)}`}>
                    Verify email
                  </Link>
                ) : undefined
              }
            />
            <SecuritySignal
              label="Password"
              value={passwordConfigured ? "Configured" : "Not set"}
              tone={passwordConfigured ? "success" : "warning"}
              icon={<KeyRound size={18} />}
              detail={security?.passwordChangedAt ? `Last changed ${formatDateTime(security.passwordChangedAt)}` : "Use a unique password for YDeck."}
              action={<Link href="#password-security">{passwordConfigured ? "Change" : "Set password"}</Link>}
            />
            <SecuritySignal
              label="Browser sessions"
              value={`${activeSessionCount} active`}
              icon={<MonitorSmartphone size={18} />}
              detail="Browsers currently authorized for this account."
              action={<Link href="#active-sessions">Review</Link>}
            />
            <SecuritySignal
              label="Desktop devices"
              value={`${security?.desktopDeviceCount ?? 0} connected`}
              icon={<Laptop size={18} />}
              detail="Authorized YDeck Desktop installations."
              action={<Link href="/settings/devices">Manage</Link>}
            />
          </div>

          <div className="security-posture__activity">
            <Activity aria-hidden size={15} />
            <span>Recent activity</span>
            <strong>{recentSecurityActivity?.label ?? "No recent security changes"}</strong>
            {recentSecurityActivity ? <time dateTime={recentSecurityActivity.at}>{formatDateTime(recentSecurityActivity.at)}</time> : null}
          </div>
        </section>
      )}

      {securityStatus === "ready" && security ? (
        <div className="security-anchor" id="password-security">
          <Panel
            className="security-password-panel"
            title={passwordConfigured ? "Change password" : "Set a password"}
            description="Use a strong password that is unique to YDeck."
          >
            <form
              className={`account-form security-password-form ${passwordConfigured ? "" : "security-password-form--new"}`}
              onSubmit={(event) => void handlePasswordSubmit(event)}
            >
              {passwordConfigured ? (
                <TextInput
                  label="Current password"
                  type={showPasswords ? "text" : "password"}
                  autoComplete="current-password"
                  value={currentPassword}
                  trailing={passwordToggle}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
              ) : null}
              <TextInput
                label="New password"
                type={showPasswords ? "text" : "password"}
                autoComplete="new-password"
                value={newPassword}
                error={passwordError}
                trailing={passwordToggle}
                onChange={(event) => setNewPassword(event.target.value)}
              />
              <TextInput
                label="Confirm new password"
                type={showPasswords ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                trailing={passwordToggle}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              <div className="security-password-form__footer">
                <p>Use at least 10 characters. A longer, unique password is safer.</p>
                <Button
                  loading={busyAction === "password"}
                  loadingLabel="Updating password…"
                  type="submit"
                  disabled={busy || !newPassword || !confirmPassword || (passwordConfigured && !currentPassword)}
                >
                  {passwordConfigured ? "Change password" : "Set password"}
                </Button>
              </div>
            </form>
          </Panel>
        </div>
      ) : null}

      <div className="security-anchor" id="active-sessions">
        <Panel
          className="security-sessions-panel"
          title="Active browser sessions"
          description="Review active browsers and revoke access you do not recognize."
          action={otherSessionCount > 0 && sessionsStatus === "ready" ? (
            <Button variant="secondary" type="button" disabled={busy} onClick={() => setRevokeOthersDialogOpen(true)}>
              Revoke other sessions
            </Button>
          ) : undefined}
        >
          {sessionsStatus === "loading" || sessionsStatus === "idle" ? (
            <SkeletonBlock rows={4} />
          ) : sessionsStatus === "error" ? (
            <EmptyState
              title="Browser sessions unavailable"
              action={<Button type="button" variant="secondary" onClick={() => void refreshAccount()}>Retry sessions</Button>}
            >
              {sessionsError ?? "YDeck could not load active browser sessions."}
            </EmptyState>
          ) : sessions.length === 0 ? (
            <EmptyState title="No active sessions" icon={<MonitorSmartphone aria-hidden size={20} />}>
              No browser sessions are currently reported for this account.
            </EmptyState>
          ) : (
            <div className="security-session-list">
              {visibleSessions.map((session) => (
                <div className="security-session" key={session.id}>
                  <span className="security-session__icon" aria-hidden><MonitorSmartphone size={17} /></span>
                  <div className="security-session__body">
                    <strong>{session.deviceName ?? session.clientType ?? "Browser session"}</strong>
                    <span>{[session.browser, session.platform, session.location].filter(Boolean).join(" · ") || "Device details unavailable"}</span>
                    <small>Last active {formatDateTime(session.lastUsedAt ?? session.createdAt ?? null)}</small>
                  </div>
                  <div className="security-session__action">
                    {session.current ? <StatusBadge tone="current">Current session</StatusBadge> : null}
                    {!session.current ? (
                      <Button
                        variant="secondary"
                        type="button"
                        loading={pendingSessionId === session.id}
                        loadingLabel="Revoking…"
                        disabled={busy}
                        onClick={() => void handleRevokeSession(session.id)}
                      >
                        Revoke
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
              {sessions.length > 5 ? (
                <button className="security-session-list__toggle" type="button" onClick={() => setShowAllSessions((expanded) => !expanded)}>
                  {showAllSessions ? "Show fewer sessions" : `Show ${sessions.length - 5} more sessions`}
                </button>
              ) : null}
            </div>
          )}
        </Panel>
      </div>

      <DangerZone title="Advanced security" description="Use these controls only if you no longer trust active sessions.">
        <p className="account-meta">Sign out everywhere revokes active sessions and returns this browser to sign in.</p>
        <div className="account-actions">
          <Button variant="secondary" type="button" onClick={() => setLogoutDialogOpen(true)}>
            Sign out everywhere
          </Button>
        </div>
      </DangerZone>

      <ConfirmationDialog
        open={revokeOthersDialogOpen}
        title="Revoke all other sessions?"
        description="Every other browser session will be signed out. This current session remains active."
        confirmLabel="Revoke other sessions"
        confirmVariant="danger"
        loading={busyAction === "revoke-others"}
        onCancel={() => setRevokeOthersDialogOpen(false)}
        onConfirm={() => void handleRevokeOthers()}
      />

      <ConfirmationDialog
        open={logoutDialogOpen}
        title="Sign out all sessions?"
        description="Existing browser and device sessions will be revoked. You will need to sign in again."
        confirmLabel="Sign out all"
        confirmVariant="danger"
        loading={busyAction === "logout-all"}
        onCancel={() => setLogoutDialogOpen(false)}
        onConfirm={() => void handleLogoutAll()}
      />
    </div>
  );
}
