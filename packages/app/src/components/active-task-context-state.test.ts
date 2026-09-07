import { expect, test } from "bun:test"
import type { LocalContextInfo } from "@opencode-ai/sdk/v2/client"
import { canWriteActiveTask, getActiveTaskState, type ActiveTaskContext } from "./active-task-context-state"

const base: LocalContextInfo = {
  requested_directory: "/repo",
  canonical_directory: "/repo",
  availability: "available",
  session_directory: "/repo",
  session_canonical_directory: "/repo",
  session_status: "found",
  concordance: "matches",
  git: {
    status: "available",
    top_level: "/repo",
    git_directory: "/repo/.git",
    common_directory: "/repo/.git",
    branch: "active-context-ui",
    head: "abc123",
    head_status: "branch",
    base_ref: null,
    base_oid: null,
    base_status: "not_requested",
    dirty: false,
    conflicts: false,
    review: "clean",
  },
}

const context = (input?: Partial<ActiveTaskContext>): ActiveTaskContext => ({
  ...base,
  task: {
    binding: {
      mtTaskID: "DA10-003",
      apexExternalRef: ".project/tasks/DA10-003-contexte-actif-interface",
      sessionID: "ses_active",
      projectID: "project_active",
      location: { directory: "/repo" },
      checkout: { repository: "/repo", worktree: "/repo", branch: "active-context-ui", head: "abc123" },
      version: 1,
    },
    execution: {
      mtTaskID: "DA10-003",
      sessionID: "ses_active",
      worktree: "/repo",
      ownerID: "owner-a",
      generation: 1,
      effects: [],
    },
  },
  ...input,
})

test("allows writes only for a concordant active task", () => {
  const value = context()
  expect(getActiveTaskState(value, "ses_active")).toBe("concordant")
  expect(canWriteActiveTask(value, "ses_active")).toBeTrue()
})

test("fails closed for missing ownership, identity divergence, and pending effects", () => {
  const incomplete = context({ task: { ...context().task!, execution: null } })
  expect(getActiveTaskState(incomplete, "ses_active")).toBe("incomplete")
  expect(canWriteActiveTask(incomplete, "ses_active")).toBeFalse()

  const divergent = context({ git: { ...base.git!, head: "def456" } })
  expect(getActiveTaskState(divergent, "ses_active")).toBe("divergent")
  expect(canWriteActiveTask(divergent, "ses_active")).toBeFalse()

  const resuming = context({
    task: {
      ...context().task!,
      execution: { ...context().task!.execution!, effects: [{ effectID: "git-write", state: "pending" }] },
    },
  })
  expect(getActiveTaskState(resuming, "ses_active")).toBe("resuming")
  expect(canWriteActiveTask(resuming, "ses_active")).toBeFalse()
})
