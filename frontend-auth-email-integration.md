# Frontend Authentication Email Integration

## Scope

The frontend requests and consumes YDeck authentication challenges. It never selects
the mail provider, sender, subject, code lifetime, or Resend configuration. Delivery
is server-side and API responses never contain a code or provider message ID.

Implemented email flows:

| Flow | Request | Confirmation |
| --- | --- | --- |
| Registration | `POST /api/v1/auth/email/register` | `POST /api/v1/auth/email/verify-code`, purpose `register` |
| Email verification/code login | `POST /api/v1/auth/email/request-code` | `POST /api/v1/auth/email/verify-code` |
| Password reset | `POST /api/v1/auth/email/password-reset/request` | `POST /api/v1/auth/email/password-reset/confirm` |

Although `change_email` exists in the challenge-purpose enum, no complete email-change
confirmation flow exists. Do not expose it in production UI.

## Request State

Successful challenge responses retain the existing contract:

```ts
interface EmailChallengeResponse {
  challengeId: string;
  expiresAt: string;
  resendAfterSeconds: number;
}

interface RegistrationChallengeResponse extends EmailChallengeResponse {
  status: 'verification_required';
}

interface PasswordResetChallengeResponse extends EmailChallengeResponse {
  status: 'accepted';
}
```

After success, keep the challenge ID in bounded flow state, start expiration and
resend timers from the server values, and show a generic "check your email" state.
Never persist the code, put it in a URL, or send it to analytics.

## Resend Behavior

Before `resendAfterSeconds`, keep resend disabled. After cooldown, repeat the same
request. The backend creates a new challenge and invalidates the previous unconsumed
challenge for the same normalized email and purpose. Replace the frontend's stored
challenge ID only after the new response succeeds.

Do not retry challenge creation automatically after an ambiguous network failure: a
message may have been provider-accepted. Preserve the entered email, show a bounded
retry action, and respect both HTTP rate-limit headers and the challenge cooldown.

## Errors

| Code | UI behavior |
| --- | --- |
| `AUTH_RATE_LIMITED` | Disable submission and honor cooldown/rate-limit timing |
| `AUTH_EMAIL_PROVIDER_RATE_LIMITED` | Show temporary delivery failure; bounded manual retry |
| `AUTH_EMAIL_PROVIDER_UNAVAILABLE` | Show temporary delivery failure and request ID |
| `AUTH_EMAIL_DELIVERY_FAILED` | Ask the user to verify the address and retry deliberately |
| `AUTH_EMAIL_CONFIGURATION_ERROR` | Show service unavailable; report request ID to operations |
| `AUTH_MAIL_DELIVERY_UNAVAILABLE` | Development provider is disabled; do not retry automatically |
| `AUTH_CODE_INVALID` | Keep form available and show a generic invalid-code error |
| `AUTH_CODE_EXPIRED` | Require a new challenge |
| `AUTH_CODE_ATTEMPTS_EXCEEDED` | Stop attempts and require a new challenge after policy allows |

Do not display provider messages, infer the provider, or reveal whether password-reset
email corresponds to an account. Password-reset request success and failure copy must
remain generic.

## Security Checklist

- Never submit `provider`, `from`, `replyTo`, subject, TTL, entitlement, or provider key.
- Never store codes in local storage, URLs, logs, analytics, or crash reports.
- Keep password-reset responses account-neutral.
- Use the returned challenge ID with the same email and purpose.
- Replace challenge state only after a successful resend response.
- Disable duplicate submissions while a request is pending.
- Surface the API request ID for support without provider details.
- Treat email delivery as pending authentication, never as verified identity.
