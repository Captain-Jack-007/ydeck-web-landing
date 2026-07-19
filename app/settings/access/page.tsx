"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, ChevronDown, ShieldCheck, UsersRound } from "lucide-react";
import {
  Alert,
  Button,
  EmptyState,
  Panel,
  SettingsHeader,
  SettingsRow,
  SkeletonBlock,
  StatusBadge,
  WorkspaceRequiredState,
} from "@/components/account/ui";
import { getHumanErrorMessage } from "@/src/api/client";
import { listWorkspaceMembers } from "@/src/api/workspace";
import type { WorkspaceMember } from "@/src/api/types";
import { useWorkspace } from "@/src/providers/workspace-provider";

function titleCase(value: string) {
  return value.replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function roleDescription(role: string | undefined, permissionCount: number) {
  if (role === "owner") return "Full administrative permissions, including workspace access and billing controls.";
  if (role === "admin") return "Administrative access based on the capabilities granted by the workspace owner.";
  if (role === "viewer") return "Read-only access to the workspace capabilities returned by the server.";
  if (role === "member") return "Standard workspace access based on the capabilities returned by the server.";
  return permissionCount > 0 ? `${permissionCount} server-authorized capabilities are available.` : "Workspace permissions are unavailable.";
}

export default function WorkspaceAccessPage() {
  const { workspace, membership, permissions, status, error, refreshWorkspace } = useWorkspace();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [membersStatus, setMembersStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [membersError, setMembersError] = useState<string | null>(null);
  const latestWorkspaceId = useRef<string | null>(workspace?.id ?? null);
  const canReadMembers = permissions.includes("member.read");
  const permissionGroups = permissions.reduce<Record<string, string[]>>((groups, permission) => {
    const [area, ...parts] = permission.split(".");
    const label = titleCase(parts.join(" ") || "access");
    groups[area] = [...(groups[area] ?? []), label];
    return groups;
  }, {});

  useEffect(() => {
    latestWorkspaceId.current = workspace?.id ?? null;
    setMembers([]);
    setMembersStatus("idle");
    setMembersError(null);
  }, [workspace?.id]);

  async function loadMembers() {
    if (!workspace?.id || !canReadMembers) return;
    const workspaceId = workspace.id;
    setMembersStatus("loading");
    setMembersError(null);
    try {
      const nextMembers = await listWorkspaceMembers(workspaceId);
      if (latestWorkspaceId.current === workspaceId) {
        setMembers(nextMembers);
        setMembersStatus("ready");
      }
    } catch (loadError) {
      setMembersError(getHumanErrorMessage(loadError));
      setMembersStatus("error");
    }
  }

  return (
    <>
      <SettingsHeader
        title="Workspace access"
        description="Review your role, server-authorized capabilities, and active members for the selected workspace."
        scope="Workspace"
      />
      {!workspace ? (
        <WorkspaceRequiredState
          title="Select a workspace to review access"
          description="Workspace roles, capabilities, and members are resolved by the selected server workspace."
        />
      ) : (
        <>
          {error ? <Alert tone="warning">{error}</Alert> : null}
          <Panel title="Access summary" description="Your effective access for this workspace." className="account-panel--feature">
            {status === "loading" || status === "idle" ? (
              <SkeletonBlock rows={3} />
            ) : status === "error" ? (
              <EmptyState
                title="Workspace access unavailable"
                action={<Button type="button" variant="secondary" onClick={() => void refreshWorkspace()}>Retry workspace</Button>}
              >
                YDeck could not restore the server-authorized workspace context.
              </EmptyState>
            ) : (
              <div className="settings-row-list">
                <SettingsRow
                  icon={<Building2 size={18} />}
                  label="Current workspace"
                  value={workspace.name}
                  detail={workspace.type === "personal" ? "Personal workspace" : "Organization workspace"}
                  status={<StatusBadge tone={workspace.status === "active" ? "active" : workspace.status ?? "neutral"}>{workspace.status ?? "Active"}</StatusBadge>}
                />
                <SettingsRow
                  icon={<ShieldCheck size={18} />}
                  label="Access level"
                  value={`${titleCase(membership?.role ?? "Workspace")} access`}
                  detail={roleDescription(membership?.role, permissions.length)}
                  status={<StatusBadge tone={membership?.role ?? "neutral"}>{membership?.role ?? "Unavailable"}</StatusBadge>}
                />
                <SettingsRow
                  icon={<UsersRound size={18} />}
                  label="Members"
                  value={membersStatus === "ready" ? `${members.length} active ${members.length === 1 ? "member" : "members"}` : "Available on request"}
                  detail={canReadMembers ? "Member details are loaded only when requested." : "Your current role cannot read workspace members."}
                  action={canReadMembers ? (
                    <Button type="button" variant="secondary" loading={membersStatus === "loading"} onClick={() => void loadMembers()}>
                      {membersStatus === "ready" ? "Refresh" : "View members"}
                    </Button>
                  ) : undefined}
                />
              </div>
            )}
          </Panel>

          {permissions.length ? (
            <details className="permission-disclosure">
              <summary>
                <span><ShieldCheck aria-hidden size={17} /><strong>Permission details</strong><small>{permissions.length} granted capabilities</small></span>
                <ChevronDown aria-hidden size={17} />
              </summary>
              <div className="permission-groups">
                {Object.entries(permissionGroups).map(([area, entries]) => (
                  <section key={area}>
                    <h3>{titleCase(area)}</h3>
                    <div>{entries.map((entry) => <span key={`${area}-${entry}`}>{entry}</span>)}</div>
                  </section>
                ))}
              </div>
            </details>
          ) : null}

          {membersError ? <Alert tone="danger">{membersError}</Alert> : null}
          {membersStatus === "ready" ? (
            <Panel title="Workspace members" description="Active memberships returned by the workspace API.">
              {members.length ? (
                <div className="member-list">
                  {members.map((member) => (
                    <div className="member-row" key={member.id ?? `${member.email}-${member.role}`}>
                      <span className="member-row__avatar" aria-hidden>{(member.displayName ?? member.email ?? "M").charAt(0).toUpperCase()}</span>
                      <div>
                        <strong>{member.displayName ?? member.email ?? "Workspace member"}</strong>
                        <small>{member.email ?? "Email unavailable"}</small>
                      </div>
                      <StatusBadge tone={member.role ?? "member"}>{member.role ?? "member"}</StatusBadge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No members returned">No active workspace memberships were returned by the server.</EmptyState>
              )}
            </Panel>
          ) : null}
        </>
      )}
    </>
  );
}
