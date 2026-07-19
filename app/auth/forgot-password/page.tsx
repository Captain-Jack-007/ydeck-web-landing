"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AuthShell, Button, TextInput } from "@/components/account/ui";
import { requestPasswordReset } from "@/src/api/auth";
import { getHumanErrorMessage } from "@/src/api/client";
import { saveAuthChallenge } from "@/src/lib/auth-flow-storage";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await requestPasswordReset({ email });
      saveAuthChallenge({
        email,
        purpose: "reset_password",
        challengeId: response.challengeId,
        expiresAt: response.expiresAt,
        resendAfterSeconds: response.resendAfterSeconds,
      });
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error) {
      setMessage(getHumanErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We’ll send a reset code if the address can receive YDeck mail."
      footer={
        <div>
          Return to <Link href="/auth/sign-in">sign in</Link>
        </div>
      }
    >
      {message ? <Alert tone="info">{message}</Alert> : null}
      <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
        <TextInput label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <div className="auth-actions">
          <Button loading={busy} loadingLabel="Sending reset code…" type="submit">
            Send reset code
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
