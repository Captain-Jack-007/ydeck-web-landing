import { apiRequest } from "@/src/api/client";
import type { AccountSecuritySummary, AccountSession, SafeUserProfile } from "@/src/api/types";

export type ProfilePatch = Partial<
  Pick<SafeUserProfile, "displayName" | "preferredLanguage" | "timeZone" | "locale" | "avatarUrl">
>;

export async function getProfile() {
  return apiRequest<{ data: SafeUserProfile }>("/api/v1/account/profile").then((response) => response.data);
}

export async function updateProfile(patch: ProfilePatch) {
  return apiRequest<{ data: SafeUserProfile }>("/api/v1/account/profile", {
    method: "PATCH",
    body: patch,
  }).then((response) => response.data);
}

export async function getSecuritySummary() {
  return apiRequest<AccountSecuritySummary>("/api/v1/account/security");
}

export async function getAccountSessions() {
  return apiRequest<{ sessions?: AccountSession[]; data?: AccountSession[] }>("/api/v1/account/sessions").then(
    (response) => response.sessions ?? response.data ?? [],
  );
}

export async function revokeAccountSession(sessionId: string) {
  return apiRequest<null>(`/api/v1/account/sessions/${encodeURIComponent(sessionId)}`, {
    method: "DELETE",
  });
}

export async function revokeOtherSessions() {
  return apiRequest<null>("/api/v1/account/sessions/revoke-others", {
    method: "POST",
    body: {},
  });
}

export async function revokeAllSessions(input: { confirmation: "REVOKE"; password?: string }) {
  return apiRequest<null>("/api/v1/account/sessions/revoke-all", {
    method: "POST",
    body: input,
  });
}

export async function setAccountPassword(input: { newPassword: string }) {
  return apiRequest<null>("/api/v1/account/password/set", {
    method: "POST",
    body: input,
  });
}

export async function requestAccountDeletion(input: { confirmation: "DELETE"; currentPassword?: string }) {
  return apiRequest<{ deletionScheduledFor?: string | null }>("/api/v1/account/deletion/request", {
    method: "POST",
    body: input,
  });
}

export async function cancelAccountDeletion() {
  return apiRequest<null>("/api/v1/account/deletion/cancel", {
    method: "POST",
    body: {},
  });
}
