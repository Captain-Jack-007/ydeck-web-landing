import { apiRequest, clearApiAccessToken, refreshWebAccessToken, setApiAccessToken } from "@/src/api/client";
import { setAccountPassword as setAccountPasswordOnAccount } from "@/src/api/account";
import { broadcastAuthInvalidation } from "@/src/lib/auth-channel";
import type {
  CurrentUser,
  EmailChallengePurpose,
  EmailChallengeResponse,
  PasswordResetChallengeResponse,
  RegistrationChallengeResponse,
  WebAuthenticationResponse,
} from "@/src/api/types";

export type DeviceDescriptor = {
  clientType: "web";
  deviceName: string;
  platform: "web";
  installationId: string;
};

export function getBrowserDevice(): DeviceDescriptor {
  let installationId = "web-browser";
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    installationId = crypto.randomUUID();
  }
  return {
    clientType: "web",
    deviceName: "Current browser",
    platform: "web",
    installationId,
  };
}

export async function registerWithEmail(input: {
  email: string;
  password: string;
  displayName?: string;
  locale?: string;
}) {
  return apiRequest<RegistrationChallengeResponse>("/api/v1/auth/email/register", {
    method: "POST",
    auth: false,
    retryOnAuth: false,
    body: input,
  });
}

export async function requestEmailCode(input: {
  email: string;
  purpose: EmailChallengePurpose;
  locale?: string;
}) {
  return apiRequest<EmailChallengeResponse>("/api/v1/auth/email/request-code", {
    method: "POST",
    auth: false,
    retryOnAuth: false,
    body: input,
  });
}

export async function verifyEmailCode(input: {
  email: string;
  purpose: EmailChallengePurpose;
  challengeId: string;
  code: string;
}) {
  const response = await apiRequest<WebAuthenticationResponse>("/api/v1/auth/email/verify-code", {
    method: "POST",
    auth: false,
    retryOnAuth: false,
    body: {
      ...input,
      clientType: "web",
      device: getBrowserDevice(),
    },
  });
  setApiAccessToken(response.accessToken);
  return response;
}

export async function loginWithPassword(input: { email: string; password: string }) {
  const response = await apiRequest<WebAuthenticationResponse>("/api/v1/auth/email/login", {
    method: "POST",
    auth: false,
    retryOnAuth: false,
    body: {
      ...input,
      clientType: "web",
      device: getBrowserDevice(),
    },
  });
  setApiAccessToken(response.accessToken);
  return response;
}

export async function requestPasswordReset(input: { email: string; locale?: string }) {
  return apiRequest<PasswordResetChallengeResponse>("/api/v1/auth/email/password-reset/request", {
    method: "POST",
    auth: false,
    retryOnAuth: false,
    body: input,
  });
}

export async function confirmPasswordReset(input: {
  email: string;
  challengeId: string;
  code: string;
  newPassword: string;
}) {
  await apiRequest<null>("/api/v1/auth/email/password-reset/confirm", {
    method: "POST",
    auth: false,
    retryOnAuth: false,
    body: input,
  });
  clearApiAccessToken();
  broadcastAuthInvalidation("password_reset");
}

export async function getCurrentUser(options: { retryOnAuth?: boolean } = {}) {
  return apiRequest<CurrentUser>("/api/v1/me", options);
}

export async function restoreWebSession() {
  const token = await refreshWebAccessToken({ throwOnFailure: true, notify: false });
  if (!token) {
    return null;
  }
  return getCurrentUser();
}

export async function logout() {
  try {
    await apiRequest<null>("/api/v1/auth/logout", {
      method: "POST",
      auth: false,
      retryOnAuth: false,
      body: {},
    });
  } finally {
    clearApiAccessToken();
    broadcastAuthInvalidation("logout");
  }
}

export async function logoutAll() {
  try {
    await apiRequest<null>("/api/v1/auth/logout-all", {
      method: "POST",
    });
  } finally {
    clearApiAccessToken();
    broadcastAuthInvalidation("logout_all");
  }
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}) {
  return apiRequest<null>("/api/v1/auth/email/change-password", {
    method: "POST",
    body: input,
  });
}

export async function setAccountPassword(input: { newPassword: string }) {
  return setAccountPasswordOnAccount(input);
}

export function getGoogleStartUrl(redirectPath = "/settings/profile", appOrigin?: string) {
  if (typeof window === "undefined") {
    if (!appOrigin) {
      return "/api/v1/auth/google/start";
    }
    const redirect = new URL(redirectPath, appOrigin);
    return `/api/v1/auth/google/start?redirect=${encodeURIComponent(redirect.toString())}`;
  }
  const redirect = new URL(redirectPath, appOrigin ?? window.location.origin);
  return `/api/v1/auth/google/start?redirect=${encodeURIComponent(
    redirect.toString(),
  )}`;
}
