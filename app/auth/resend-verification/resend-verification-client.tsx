"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Alert, AuthShell, Button, TextInput } from "@/components/account/ui";
import { requestEmailCode } from "@/src/api/auth";
import { getHumanErrorMessage } from "@/src/api/client";
import { saveAuthChallenge } from "@/src/lib/auth-flow-storage";
import { authReturnToParam, safeAuthReturnTo } from "@/src/lib/auth-return";

export default function ResendVerificationClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeAuthReturnTo(searchParams.get("returnTo"));
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await requestEmailCode({ email, purpose: "verify_email" });
      const resendAvailableAt = new Date(Date.now() + response.resendAfterSeconds * 1000).toISOString();
      saveAuthChallenge({
        email,
        purpose: "verify_email",
        challengeId: response.challengeId,
        expiresAt: response.expiresAt,
        resendAfterSeconds: response.resendAfterSeconds,
        resendAvailableAt,
      });
      const returnParam = returnTo === "/" ? "" : `&returnTo=${encodeURIComponent(returnTo)}`;
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}&purpose=verify_email${returnParam}`);
    } catch (error) {
      setMessage(getHumanErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Send a verification code"
      subtitle="Enter your email and we will send a fresh code when verification is available."
      footer={<div>Back to <Link href={`/auth/sign-in${authReturnToParam(returnTo)}`}>sign in</Link></div>}
    >
      {message ? <Alert tone="danger" title="Unable to send code">{message}</Alert> : null}
      <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
        <TextInput label="Email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <div className="auth-actions">
          <Button loading={busy} loadingLabel="Sending code…" type="submit" disabled={!email}>
            Send verification code
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
