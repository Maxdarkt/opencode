import { expect, test } from "bun:test"
import type { LocalContextInfo } from "@opencode-ai/sdk/v2/client"
import { createActiveTaskWriteGuard } from "./active-task-write-guard"
import { sendFollowupDraft } from "./prompt-input/submit"

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

const context = (input?: Partial<LocalContextInfo>): LocalContextInfo => ({
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

async function sendWith(contextValue: LocalContextInfo) {
  const writes: unknown[] = []
  const blocked: string[] = []
  const allowed = await sendFollowupDraft({
    api: {
      prompt: async (input: unknown) => {
        writes.push(input)
      },
    } as never,
    sync: {
      session: { optimistic: { add: () => undefined, remove: () => undefined } },
    } as never,
    serverSync: { session: { set: () => undefined } } as never,
    draft: {
      sessionID: "ses_active",
      sessionDirectory: "/repo",
      prompt: [{ type: "text", content: "Implement the guard", start: 0, end: 19 }],
      context: [],
      agent: "build",
      model: { providerID: "provider", modelID: "model" },
    },
    before: createActiveTaskWriteGuard(async () => contextValue, "ses_active", (reason) => blocked.push(reason)),
  })
  return { allowed, blocked, writes }
}

test("prevents prompt writes while active task context is incomplete, divergent, or resuming", async () => {
  const incomplete = context({ task: { ...context().task!, execution: null } })
  const divergent = context({ git: { ...base.git!, head: "def456" } })
  const resuming = context({
    task: {
      ...context().task!,
      execution: { ...context().task!.execution!, effects: [{ effectID: "git-write", state: "pending" }] },
    },
  })

  for (const [value, reason] of [
    [incomplete, "incomplete"],
    [divergent, "divergent"],
    [resuming, "resuming"],
  ] as const) {
    const result = await sendWith(value)
    expect(result.allowed).toBeFalse()
    expect(result.writes).toEqual([])
    expect(result.blocked).toEqual([reason])
  }
})

test("allows prompt writes only with a concordant active task context", async () => {
  const result = await sendWith(context())
  expect(result.allowed).toBeTrue()
  expect(result.writes).toHaveLength(1)
  expect(result.blocked).toEqual([])
})
