"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Alert, AuthShell, Button, PasswordInput, TextInput } from "@/components/account/ui";
import { getGoogleStartUrl, loginWithPassword } from "@/src/api/auth";
import { getHumanErrorMessage } from "@/src/api/client";
import { authReturnToParam, safeAuthReturnTo } from "@/src/lib/auth-return";
import { useAuth } from "@/src/providers/auth-provider";

export default function SignInClient({ appOrigin }: { appOrigin: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeAuthReturnTo(searchParams.get("returnTo"));
  const { setAuthenticatedUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handlePasswordSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await loginWithPassword({ email, password });
      setAuthenticatedUser(response.user, response.accessToken);
      router.push(returnTo);
    } catch (error) {
      setMessage(getHumanErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Sign in to YDeck"
      subtitle="Continue to your presentation workspace."
      footer={
        <div>
          New here? <Link href={`/auth/sign-up${authReturnToParam(returnTo)}`}>Create an account</Link>
        </div>
      }
    >
      {message ? <Alert tone="danger" title="Unable to sign in">{message}</Alert> : null}
      <form className="auth-form" onSubmit={(event) => void handlePasswordSignIn(event)}>
        <TextInput label="Email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <PasswordInput
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          trailing={
            <button
              className="account-field__toggle"
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff aria-hidden size={17} /> : <Eye aria-hidden size={17} />}
            </button>
          }
        />
        <div className="auth-actions">
          <Button loading={busy} loadingLabel="Signing in…" type="submit">
            Sign in
          </Button>
        </div>
      </form>

      <div className="auth-divider" aria-hidden="true"><span>or</span></div>
      <div className="auth-actions auth-links">
        <Link className="account-button account-button--secondary" href={getGoogleStartUrl(returnTo, appOrigin)}>
          Continue with Google
        </Link>
        <Link className="account-link" href="/auth/forgot-password">
          Forgot password?
        </Link>
      </div>
    </AuthShell>
  );
}
