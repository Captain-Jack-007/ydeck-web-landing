"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MailCheck } from "lucide-react";
import { Alert, Button, Panel, RecoveryState, SettingsHeader, SettingsRow, SkeletonBlock, StatusBadge, TextInput } from "@/components/account/ui";
import { getHumanErrorMessage } from "@/src/api/client";
import { useAccount } from "@/src/providers/account-provider";

export default function ProfilePage() {
  const { profile, profileStatus, profileError, errorDetails, saveProfile, refreshAccount } = useAccount();
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "danger"; message: string } | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    if (!profile) {
      return;
    }
    setDisplayName(profile.displayName ?? "");
  }, [profile]);

  const initials = (displayName || profile?.email || profile?.displayName || "Y")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  const avatarUrl = profile?.avatarUrl ?? "";
  const dirty = Boolean(profile && (displayName || "") !== (profile.displayName ?? ""));

  useEffect(() => {
    setAvatarFailed(false);
  }, [profile?.avatarUrl]);

  useEffect(() => {
    if (!dirty) {
      return;
    }
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  function resetForm() {
    if (!profile) {
      return;
    }
    setDisplayName(profile.displayName ?? "");
    setFieldError(null);
    setFeedback(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dirty) {
      return;
    }
    if (displayName.trim().length > 0 && displayName.trim().length < 2) {
      setFieldError("Use at least 2 characters for the display name.");
      return;
    }
    setBusy(true);
    setFeedback(null);
    setFieldError(null);
    try {
      await saveProfile({
        displayName: displayName || null,
      });
      await refreshAccount();
      setFeedback({ tone: "success", message: "Your profile changes are saved." });
    } catch (saveError) {
      setFeedback({ tone: "danger", message: getHumanErrorMessage(saveError) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SettingsHeader
        title="Profile"
        description="Manage the identity shown across YDeck and connected Desktop installations."
        scope="Personal"
      />
      {feedback ? <Alert tone={feedback.tone}>{feedback.message}</Alert> : null}
      {profileStatus === "loading" || profileStatus === "idle" ? (
        <Panel title="Personal details" description="Loading your profile information.">
          <SkeletonBlock rows={4} />
        </Panel>
      ) : profileStatus === "error" ? (
        <RecoveryState
          title="Profile unavailable"
          description="YDeck could not load your saved profile. Editing remains disabled to protect your account data."
          message={profileError ?? "Something went wrong. Please try again."}
          requestId={errorDetails?.requestId ?? null}
          category={errorDetails?.category ?? "Profile request failed"}
          timestamp={errorDetails?.timestamp ?? "Not recorded"}
          onRetry={() => void refreshAccount()}
        />
      ) : (
        <form className="settings-form-stack" onSubmit={(event) => void handleSubmit(event)}>
          <section className="profile-identity">
            <div className="profile-identity__avatar">
              {avatarUrl && !avatarFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="" src={avatarUrl} referrerPolicy="no-referrer" onError={() => setAvatarFailed(true)} />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="profile-identity__body">
              <span className="profile-identity__label">YDeck identity</span>
              <div className="profile-identity__heading">
                <h2>{displayName || profile?.email || "YDeck user"}</h2>
              </div>
              <p>{profile?.email}</p>
            </div>
            <div className="profile-identity__status">
              <StatusBadge tone={profile?.emailVerified ? "success" : "warning"}>{profile?.emailVerified ? "Email verified" : "Verification required"}</StatusBadge>
              <StatusBadge tone={profile?.accountStatus === "active" ? "success" : "neutral"}>
                {profile?.accountStatus === "active" ? "Account active" : profile?.accountStatus ?? "Status unavailable"}
              </StatusBadge>
            </div>
          </section>

          <Panel title="Personal details" description="This is how your account appears across workspace activity and Desktop pairing.">
            <div className="account-form">
              <TextInput label="Display name" value={displayName} error={fieldError} onChange={(event) => setDisplayName(event.target.value)} />
              <div className="settings-row-list settings-row-list--embedded">
                <SettingsRow
                  icon={<MailCheck size={18} />}
                  label="Primary email"
                  value={<span title={profile?.email}>{profile?.email}</span>}
                  detail={profile?.emailVerified ? "Verified for sign-in and account recovery." : "Verify this address before relying on account recovery."}
                  status={<StatusBadge tone={profile?.emailVerified ? "success" : "warning"}>{profile?.emailVerified ? "Verified" : "Verification required"}</StatusBadge>}
                  action={!profile?.emailVerified && profile?.email ? <Link className="account-link" href={`/auth/resend-verification?email=${encodeURIComponent(profile.email)}`}>Verify email</Link> : undefined}
                />
              </div>
              <div className="account-actions">
                <Button loading={busy} type="submit" disabled={!dirty}>
                  Save profile
                </Button>
                <Button variant="secondary" type="button" disabled={!dirty || busy} onClick={resetForm}>
                  Revert changes
                </Button>
              </div>
            </div>
          </Panel>
        </form>
      )}
    </>
  );
}
