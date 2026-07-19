"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Alert, AuthShell, Button, TextInput } from "@/components/account/ui";
import { confirmPasswordReset } from "@/src/api/auth";
import { getHumanErrorMessage } from "@/src/api/client";
import { clearAuthChallenge, readAuthChallenge } from "@/src/lib/auth-flow-storage";

export default function ResetPasswordClient() {
  const params = useSearchParams();
  const queryEmail = params.get("email") ?? "";
  const stored = useMemo(() => readAuthChallenge("reset_password"), []);
  const [email, setEmail] = useState(queryEmail || stored?.email || "");
  const challengeId = stored?.challengeId ?? "";
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const missingResetSession = !challengeId;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await confirmPasswordReset({ email, challengeId, code, newPassword });
      clearAuthChallenge();
      setMessage("Password updated. Sign in again to continue.");
    } catch (error) {
      setMessage(getHumanErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Enter the reset code from your email and choose a new password."
      footer={
        <div>
          Return to <Link href="/auth/sign-in">sign in</Link>
        </div>
      }
    >
      {message ? <Alert tone="info">{message}</Alert> : null}
      {missingResetSession ? (
        <Alert tone="warning">
          Request a new reset code before setting a password. Reset links expire for your protection.
        </Alert>
      ) : null}
      <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
        <TextInput label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <TextInput label="Code" autoComplete="one-time-code" inputMode="numeric" value={code} onChange={(event) => setCode(event.target.value)} />
        <TextInput
          label="New password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
        <div className="auth-actions">
          <Button loading={busy} loadingLabel="Updating password…" type="submit" disabled={missingResetSession}>
            Update password
          </Button>
          {missingResetSession ? (
            <Link className="account-link" href="/auth/forgot-password">
              Request code
            </Link>
          ) : null}
        </div>
      </form>
    </AuthShell>
  );
}
