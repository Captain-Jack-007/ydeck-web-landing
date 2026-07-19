import type { EmailChallengePurpose } from "@/src/api/types";

export type StoredAuthChallenge = {
  email: string;
  purpose: EmailChallengePurpose;
  challengeId: string;
  expiresAt: string;
  resendAfterSeconds: number;
  resendAvailableAt?: string;
};

const key = "ydeck.auth.challenge";

export function saveAuthChallenge(challenge: StoredAuthChallenge) {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  sessionStorage.setItem(key, JSON.stringify(challenge));
}

export function readAuthChallenge(purpose?: EmailChallengePurpose) {
  if (typeof sessionStorage === "undefined") {
    return null;
  }
  const raw = sessionStorage.getItem(key);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as StoredAuthChallenge;
    if (purpose && parsed.purpose !== purpose) {
      return null;
    }
    return parsed;
  } catch {
    sessionStorage.removeItem(key);
    return null;
  }
}

export function clearAuthChallenge() {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem(key);
  }
}
