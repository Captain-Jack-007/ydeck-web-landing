import assert from "node:assert/strict";
import { test } from "node:test";
import type { WorkspaceCurrentResponse } from "@/src/api/types";
import {
  isWorkspaceCurrentResponse,
  mergeAuthoritativeWorkspace,
  normalizeWorkspaceList,
} from "@/src/lib/workspace-state";

const current: WorkspaceCurrentResponse = {
  workspace: { id: "workspace-personal", name: "Personal workspace", type: "personal" },
  membership: { id: "membership-1", role: "owner" },
  permissions: ["workspace.read"],
};

test("workspace list normalization accepts the backend array contract", () => {
  assert.deepEqual(normalizeWorkspaceList([
    { id: "workspace-personal", name: "Personal workspace" },
    { id: "workspace-team", name: "Team workspace" },
  ]).map((workspace) => workspace.id), ["workspace-personal", "workspace-team"]);
});

test("workspace list normalization keeps compatibility wrappers and rejects malformed entries", () => {
  assert.deepEqual(normalizeWorkspaceList({
    workspaces: [
      { id: "workspace-team", name: "Team workspace" },
      { id: "", name: "Invalid" },
      null,
    ],
  }).map((workspace) => workspace.id), ["workspace-team"]);
});

test("backend current workspace is authoritative and other memberships remain switchable", () => {
  const result = mergeAuthoritativeWorkspace(current, [
    { id: "workspace-team", name: "Team workspace", isCurrent: true },
    { id: "workspace-personal", name: "Personal workspace" },
  ]);

  assert.equal(result.find((workspace) => workspace.id === "workspace-personal")?.isCurrent, true);
  assert.equal(result.find((workspace) => workspace.id === "workspace-team")?.isCurrent, false);
  assert.equal(result.length, 2);
});

test("an authoritative workspace missing from a stale list is retained", () => {
  const result = mergeAuthoritativeWorkspace(current, [{ id: "workspace-team", name: "Team workspace" }]);
  assert.deepEqual(result.map((workspace) => workspace.id), ["workspace-team", "workspace-personal"]);
  assert.equal(result.at(-1)?.isCurrent, true);
});

test("current workspace responses are validated before entering provider state", () => {
  assert.equal(isWorkspaceCurrentResponse(current), true);
  assert.equal(isWorkspaceCurrentResponse({ workspace: null, membership: {}, permissions: [] }), false);
  assert.equal(isWorkspaceCurrentResponse({ ...current, permissions: ["workspace.read", 42] }), false);
});
