import type { Workspace, WorkspaceCurrentResponse } from "@/src/api/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function isWorkspace(value: unknown): value is Workspace {
  return isRecord(value) && typeof value.id === "string" && value.id.length > 0 && typeof value.name === "string";
}

export function isWorkspaceCurrentResponse(value: unknown): value is WorkspaceCurrentResponse {
  if (!isRecord(value) || !isWorkspace(value.workspace) || !isRecord(value.membership)) {
    return false;
  }
  return (
    typeof value.membership.role === "string" &&
    Array.isArray(value.permissions) &&
    value.permissions.every((permission) => typeof permission === "string")
  );
}

export function normalizeWorkspaceList(value: unknown): Workspace[] {
  const candidate = Array.isArray(value)
    ? value
    : isRecord(value) && Array.isArray(value.workspaces)
      ? value.workspaces
      : isRecord(value) && Array.isArray(value.data)
        ? value.data
        : [];

  const workspaces = new Map<string, Workspace>();
  for (const workspace of candidate) {
    if (isWorkspace(workspace)) {
      workspaces.set(workspace.id, workspace);
    }
  }
  return Array.from(workspaces.values());
}

export function mergeAuthoritativeWorkspace(
  current: WorkspaceCurrentResponse,
  availableWorkspaces: Workspace[],
): Workspace[] {
  const merged = new Map(availableWorkspaces.map((workspace) => [workspace.id, workspace]));
  if (!merged.has(current.workspace.id)) {
    merged.set(current.workspace.id, current.workspace);
  }
  return Array.from(merged.values()).map((workspace) => ({
    ...workspace,
    isCurrent: workspace.id === current.workspace.id,
  }));
}
