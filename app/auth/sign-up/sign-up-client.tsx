"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Alert, AuthShell, Button, TextInput } from "@/components/account/ui";
import { detectClientLocale, readStoredLocalePreference, toAuthApiLocale } from "@/lib/locale";
import { registerWithEmail } from "@/src/api/auth";
import { getHumanErrorMessage, YDeckApiError } from "@/src/api/client";
import { saveAuthChallenge } from "@/src/lib/auth-flow-storage";
import { authReturnToParam, safeAuthReturnTo } from "@/src/lib/auth-return";

export default function SignUpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeAuthReturnTo(searchParams.get("returnTo"));
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [registrationUnavailable, setRegistrationUnavailable] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setRegistrationUnavailable(false);
    try {
      const clientLocale = readStoredLocalePreference() ?? detectClientLocale();
      const response = await registerWithEmail({
        email,
        password,
        displayName: displayName || undefined,
        locale: toAuthApiLocale(clientLocale),
      });
      saveAuthChallenge({
        email,
        purpose: "register",
        challengeId: response.challengeId,
        expiresAt: response.expiresAt,
        resendAfterSeconds: response.resendAfterSeconds,
        resendAvailableAt: new Date(Date.now() + response.resendAfterSeconds * 1000).toISOString(),
      });
      const returnParam = returnTo === "/" ? "" : `&returnTo=${encodeURIComponent(returnTo)}`;
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}&purpose=register${returnParam}`);
    } catch (error) {
      setRegistrationUnavailable(error instanceof YDeckApiError && error.code === "AUTH_REGISTRATION_UNAVAILABLE");
      setMessage(getHumanErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Sign up with email"
      subtitle="Use your email address to create an account. We will send a verification code before opening your workspace."
      footer={
        <div>
          Already have an account? <Link href={`/auth/sign-in${authReturnToParam(returnTo)}`}>Sign in</Link>
        </div>
      }
    >
      {message ? <Alert tone={registrationUnavailable ? "warning" : "danger"} title={registrationUnavailable ? "Registration unavailable" : "Unable to create account"}>{message}</Alert> : null}
      {registrationUnavailable ? (
        <div className="auth-recovery-actions" aria-label="Account recovery options">
          <Link className="account-button account-button--primary" href={`/auth/sign-in${authReturnToParam(returnTo)}`}>
            Sign in instead
          </Link>
          <Link
            className="account-button account-button--secondary"
            href={`/auth/resend-verification?email=${encodeURIComponent(email)}${returnTo === "/" ? "" : `&returnTo=${encodeURIComponent(returnTo)}`}`}
          >
            Send verification code
          </Link>
          <Link className="account-link" href={`/auth/forgot-password?email=${encodeURIComponent(email)}`}>
            Reset password
          </Link>
        </div>
      ) : null}
      <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
        <TextInput label="Email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <TextInput label="Display name" autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
        <TextInput label="Password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <div className="auth-actions">
          <Button loading={busy} loadingLabel="Creating account…" type="submit">
            Continue with email
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
