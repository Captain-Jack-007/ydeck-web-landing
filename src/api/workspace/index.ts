import { apiRequest } from "@/src/api/client";
import type { Workspace, WorkspaceCurrentResponse, WorkspaceMember } from "@/src/api/types";
import { normalizeWorkspaceList } from "@/src/lib/workspace-state";

export async function listWorkspaces() {
  return apiRequest<Workspace[] | { workspaces?: Workspace[]; data?: Workspace[] }>("/api/v1/workspaces").then(
    normalizeWorkspaceList,
  );
}

export async function getCurrentWorkspace() {
  return apiRequest<WorkspaceCurrentResponse>("/api/v1/workspaces/current");
}

export async function selectWorkspace(workspaceId: string) {
  return apiRequest<WorkspaceCurrentResponse>(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/select`, {
    method: "POST",
    body: {},
  });
}

export async function createWorkspace(input: { name: string; slug?: string }) {
  return apiRequest<Workspace>("/api/v1/workspaces", {
    method: "POST",
    body: input,
  });
}

export async function updateWorkspace(workspaceId: string, input: { name?: string; slug?: string | null }) {
  return apiRequest<Workspace>(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}`, {
    method: "PATCH",
    body: input,
  });
}

export async function listWorkspaceMembers(workspaceId: string) {
  return apiRequest<{ members?: WorkspaceMember[]; data?: WorkspaceMember[] }>(
    `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/members`,
  ).then((response) => response.members ?? response.data ?? []);
}
