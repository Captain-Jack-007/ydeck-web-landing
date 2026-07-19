"use client";

import Link from "next/link";
import { CalendarClock, MailCheck, UserRound } from "lucide-react";
import { useState } from "react";
import {
  Alert,
  Button,
  ConfirmationDialog,
  DangerZone,
  EmptyState,
  Panel,
  SettingsHeader,
  SettingsRow,
  SkeletonBlock,
  StatusBadge,
  TextInput,
} from "@/components/account/ui";
import { cancelAccountDeletion, requestAccountDeletion } from "@/src/api/account";
import { getHumanErrorMessage } from "@/src/api/client";
import { formatDateTime } from "@/src/lib/format";
import { useAccount } from "@/src/providers/account-provider";

export default function AccountPage() {
  const { profile, security, profileStatus, securityStatus, profileError, refreshAccount } = useAccount();
  const [currentPassword, setCurrentPassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountAction, setAccountAction] = useState<"request-deletion" | "cancel-deletion" | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "danger"; message: string } | null>(null);
  const accountBusy = accountAction !== null;
  const accountStatusLabel = profile?.accountStatus === "active"
    ? "Active"
    : profile?.accountStatus === "deletion_pending"
      ? "Deletion requested"
      : profile?.accountStatus === "deleted"
        ? "Deleted"
        : profile?.accountStatus ?? "Unavailable";

  async function handleDeletionRequest() {
    setAccountAction("request-deletion");
    setFeedback(null);
    try {
      await requestAccountDeletion({
        confirmation: "DELETE",
        currentPassword: security?.passwordConfigured ? currentPassword || undefined : undefined,
      });
      setCurrentPassword("");
      setDeleteConfirm("");
      setDeleteDialogOpen(false);
      await refreshAccount();
      setFeedback({ tone: "success", message: "Account deletion is scheduled. You can cancel it before processing begins." });
    } catch (error) {
      setFeedback({ tone: "danger", message: getHumanErrorMessage(error) });
    } finally {
      setAccountAction(null);
    }
  }

  async function handleDeletionCancel() {
    setAccountAction("cancel-deletion");
    setFeedback(null);
    try {
      await cancelAccountDeletion();
      await refreshAccount();
      setFeedback({ tone: "success", message: "Account deletion was canceled." });
    } catch (error) {
      setFeedback({ tone: "danger", message: getHumanErrorMessage(error) });
    } finally {
      setAccountAction(null);
    }
  }

  return (
    <>
      <SettingsHeader
        title="Account and data"
        description="Review your personal account status and manage the YDeck account lifecycle."
        scope="Account"
      />
      {feedback ? <Alert tone={feedback.tone}>{feedback.message}</Alert> : null}

      <Panel title="Personal account" description="This status belongs to you and is separate from workspace access or billing.">
        {profileStatus === "loading" || profileStatus === "idle" ? (
          <SkeletonBlock rows={3} />
        ) : profileStatus === "error" || !profile ? (
          <EmptyState
            title="Account status unavailable"
            action={<Button type="button" variant="secondary" onClick={() => void refreshAccount()}>Retry account</Button>}
          >
            {profileError ?? "YDeck could not load your personal account status."}
          </EmptyState>
        ) : (
          <div className="settings-row-list">
            <SettingsRow
              icon={<UserRound size={18} />}
              label="Account status"
              value={accountStatusLabel}
              detail="Controls whether this personal YDeck identity can sign in and connect Desktop."
              status={<StatusBadge tone={profile.accountStatus === "active" ? "active" : "warning"}>{accountStatusLabel}</StatusBadge>}
            />
            <SettingsRow
              icon={<MailCheck size={18} />}
              label="Primary email"
              value={<span title={profile.email}>{profile.email}</span>}
              detail={profile.emailVerified ? "Verified for sign-in and account recovery." : "Verification is required before relying on account recovery."}
              status={<StatusBadge tone={profile.emailVerified ? "success" : "warning"}>{profile.emailVerified ? "Verified" : "Verification required"}</StatusBadge>}
              action={!profile.emailVerified ? <Link className="account-link" href={`/auth/resend-verification?email=${encodeURIComponent(profile.email)}`}>Verify email</Link> : undefined}
            />
            <SettingsRow
              icon={<CalendarClock size={18} />}
              label="Account created"
              value={formatDateTime(profile.createdAt)}
              detail="Workspace creation dates and billing periods are tracked separately."
            />
          </div>
        )}
      </Panel>

      <DangerZone title="Delete YDeck account" description="Permanently remove this personal account after the server recovery period.">
        {profile?.accountStatus === "deletion_pending" ? (
          <Alert tone="warning">
            Deletion is scheduled for {formatDateTime(security?.deletionScheduledFor ?? profile.deletionScheduledFor)}.
          </Alert>
        ) : null}
        {securityStatus === "error" ? (
          <Alert tone="warning">Security details are unavailable. YDeck may require additional verification before accepting deletion.</Alert>
        ) : null}
        <ul className="lifecycle-consequences">
          <li>Browser sessions and connected Desktop access are revoked.</li>
          <li>Workspace ownership or active subscriptions may block processing.</li>
          <li>Shared workspace content owned by other members is retained.</li>
        </ul>
        <div className="account-actions">
          {profile?.accountStatus !== "deletion_pending" ? (
            <Button variant="danger" type="button" disabled={accountBusy || profileStatus !== "ready"} onClick={() => setDeleteDialogOpen(true)}>
              Request deletion
            </Button>
          ) : (
            <Button
              loading={accountAction === "cancel-deletion"}
              variant="secondary"
              type="button"
              disabled={accountBusy}
              onClick={() => void handleDeletionCancel()}
            >
              Cancel deletion
            </Button>
          )}
        </div>
      </DangerZone>

      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Request account deletion?"
        description="This starts the personal account deletion lifecycle. Workspace deletion is a separate action."
        confirmLabel="Request deletion"
        loading={accountAction === "request-deletion"}
        disabled={deleteConfirm !== "DELETE" || (security?.passwordConfigured === true && !currentPassword)}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeleteConfirm("");
          setCurrentPassword("");
        }}
        onConfirm={() => void handleDeletionRequest()}
      >
        <div className="account-form">
          {security?.passwordConfigured ? (
            <TextInput
              label="Current password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          ) : null}
          <TextInput
            label="Type DELETE to continue"
            value={deleteConfirm}
            onChange={(event) => setDeleteConfirm(event.target.value.toUpperCase())}
            hint="This action cannot be undone after the recovery period ends."
          />
        </div>
      </ConfirmationDialog>
    </>
  );
}
