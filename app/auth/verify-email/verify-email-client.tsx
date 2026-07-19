"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Alert, AuthShell, Button, TextInput } from "@/components/account/ui";
import { requestEmailCode, verifyEmailCode } from "@/src/api/auth";
import { getHumanErrorMessage } from "@/src/api/client";
import type { EmailChallengePurpose } from "@/src/api/types";
import { clearAuthChallenge, readAuthChallenge, saveAuthChallenge } from "@/src/lib/auth-flow-storage";
import { safeAuthReturnTo } from "@/src/lib/auth-return";
import { useCountdown } from "@/src/lib/use-countdown";
import { useAuth } from "@/src/providers/auth-provider";

function useVerificationContext() {
  const params = useSearchParams();
  return useMemo(
    () => ({
      email: params.get("email") ?? "",
      purpose: (params.get("purpose") as EmailChallengePurpose | null) ?? "register",
      returnTo: safeAuthReturnTo(params.get("returnTo")),
    }),
    [params],
  );
}

export default function VerifyEmailClient() {
  const router = useRouter();
  const query = useVerificationContext();
  const { setAuthenticatedUser } = useAuth();
  const stored = useMemo(() => readAuthChallenge(query.purpose), [query.purpose]);
  const email = useMemo(() => query.email || stored?.email || "", [query.email, stored?.email]);
  const [challengeId, setChallengeId] = useState(stored?.challengeId ?? "");
  const [resendAvailableAt, setResendAvailableAt] = useState<string | null>(stored?.resendAvailableAt ?? null);
  const [code, setCode] = useState("");
  const [busyAction, setBusyAction] = useState<"verify" | "resend" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const resendCountdown = useCountdown(resendAvailableAt);
  const busy = busyAction !== null;

  useEffect(() => {
    if (stored) {
      setChallengeId(stored.challengeId);
      setResendAvailableAt(stored.resendAvailableAt ?? null);
    }
  }, [stored]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !challengeId) {
      setMessage("We could not find your verification request. Please request a new code.");
      return;
    }
    setBusyAction("verify");
    setMessage(null);
    try {
      const response = await verifyEmailCode({
        email,
        purpose: query.purpose,
        challengeId,
        code,
      });
      clearAuthChallenge();
      setAuthenticatedUser(response.user, response.accessToken);
      router.push(query.returnTo);
    } catch (error) {
      setMessage(getHumanErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function handleResend() {
    if (!email) {
      setMessage("We could not find your email address. Please request a new code.");
      return;
    }
    setBusyAction("resend");
    setMessage(null);
    try {
      const response = await requestEmailCode({ email, purpose: query.purpose });
      const resendAvailableAt = new Date(Date.now() + response.resendAfterSeconds * 1000).toISOString();
      saveAuthChallenge({
        email,
        purpose: query.purpose,
        challengeId: response.challengeId,
        expiresAt: response.expiresAt,
        resendAfterSeconds: response.resendAfterSeconds,
        resendAvailableAt,
      });
      setChallengeId(response.challengeId);
      setResendAvailableAt(resendAvailableAt);
      setMessage("A new code was sent.");
    } catch (error) {
      setMessage(getHumanErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <AuthShell
      title="Verify your email"
      subtitle={
        email
          ? `Enter the 6-digit code we sent to ${email} to activate your account.`
          : "Enter the 6-digit code we sent to your inbox to activate your account."
      }
      footer={
        <div>
          Need a new account? <Link href="/auth/sign-up">Create one</Link>
        </div>
      }
    >
      {message ? <Alert tone="info">{message}</Alert> : null}
      <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
        <TextInput
          label="Code"
          autoComplete="one-time-code"
          inputMode="numeric"
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
        <div className="auth-actions">
          <Button
            loading={busyAction === "verify"}
            loadingLabel="Confirming code…"
            type="submit"
            disabled={busyAction === "resend"}
          >
            Verify email
          </Button>
          <Button
            variant="secondary"
            loading={busyAction === "resend"}
            loadingLabel="Sending code…"
            type="button"
            onClick={() => void handleResend()}
            disabled={!email || busy || resendCountdown > 0}
          >
            {resendCountdown > 0 ? `Resend code (${resendCountdown}s)` : "Resend code"}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
