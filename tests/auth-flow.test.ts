import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { clearAuthChallenge, readAuthChallenge, saveAuthChallenge } from "@/src/lib/auth-flow-storage";
import { authReturnToParam, safeAuthReturnTo } from "@/src/lib/auth-return";
import { toAuthApiLocale } from "@/lib/locale";

const storage = new Map<string, string>();

Object.defineProperty(globalThis, "sessionStorage", {
  configurable: true,
  value: {
    getItem(key: string) {
      return storage.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      storage.set(key, value);
    },
    removeItem(key: string) {
      storage.delete(key);
    },
  },
});

afterEach(() => {
  clearAuthChallenge();
  storage.clear();
});

test("auth challenge metadata is stored only in session scope", () => {
  saveAuthChallenge({
    email: "person@example.com",
    purpose: "register",
    challengeId: "challenge_123",
    expiresAt: "2026-07-15T00:00:00.000Z",
    resendAfterSeconds: 30,
  });

  const challenge = readAuthChallenge("register");
  assert.equal(challenge?.challengeId, "challenge_123");
  assert.equal(challenge?.email, "person@example.com");
});

test("auth challenge lookup ignores other purposes", () => {
  saveAuthChallenge({
    email: "person@example.com",
    purpose: "reset_password",
    challengeId: "reset_123",
    expiresAt: "2026-07-15T00:00:00.000Z",
    resendAfterSeconds: 30,
  });

  assert.equal(readAuthChallenge("login"), null);
});

test("auth return target preserves desktop pairing code", () => {
  const pairingPath = "/desktop/pairing?user_code=ABC123-DEF456";

  assert.equal(safeAuthReturnTo(pairingPath), pairingPath);
  assert.equal(authReturnToParam(pairingPath), "?returnTo=%2Fdesktop%2Fpairing%3Fuser_code%3DABC123-DEF456");
});

test("auth return target rejects external and auth-loop URLs", () => {
  assert.equal(safeAuthReturnTo("https://evil.example/desktop/pairing?user_code=ABC"), "/workspace");
  assert.equal(safeAuthReturnTo("//evil.example/desktop/pairing?user_code=ABC"), "/workspace");
  assert.equal(safeAuthReturnTo("/auth/sign-in?returnTo=/desktop/pairing"), "/workspace");
});

test("auth locale maps both Uzbek scripts to the backend locale", () => {
  assert.equal(toAuthApiLocale("uz-Latn"), "uz");
  assert.equal(toAuthApiLocale("uz-Cyrl"), "uz");
  assert.equal(toAuthApiLocale("zh"), "zh");
});
