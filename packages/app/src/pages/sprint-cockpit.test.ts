import { describe, expect, test } from "bun:test"
import type { OpencodeClient, TaskOwnershipSnapshot } from "@opencode-ai/sdk/v2/client"
import { dict } from "@/i18n/en"
import { sprintCockpitInput } from "./sprint-cockpit-input"
import { cockpitLaunchEnabled, confirmCockpitAction } from "./sprint-cockpit-launch"
import { loadSprintCockpit } from "./sprint-cockpit-load"
import { cockpitEligibilityBadge, formatFact, inaccessibleCockpitView, mapCockpitView, worktreeLabelFromPath } from "./sprint-cockpit-mapper"
import { cockpitPromptText } from "./sprint-cockpit-prompt"
import { createCockpitLayoutState, reduceCockpitLayoutState } from "./sprint-cockpit-state"
import type { SensitiveAction } from "./sprint-cockpit-fixtures"
import { legacySessionHref } from "@/utils/session-route"

const provenance = (source: "task_binding" | "runtime_snapshot" | "task_execution" | "attention_input", reference: string) => ({
  source,
  reference,
})

const missing = (state: "absent" | "unknown" | "inaccessible" | "invalid", source: "task_binding" | "runtime_snapshot" | "task_execution" | "attention_input", reference: string) => ({
  state,
  provenance: provenance(source, reference),
  freshness: {},
})

const snapshot = (
  entries: TaskOwnershipSnapshot["entries"],
  result: TaskOwnershipSnapshot["result"] = { kind: "complete" },
): TaskOwnershipSnapshot => ({
  state: "available",
  provenance: provenance("runtime_snapshot", "fixture"),
  freshness: {},
  result,
  entries,
})

const stubEntry = (index: 0 | 1): TaskOwnershipSnapshot["entries"][number] => ({
  identity: sprintCockpitInput.identities[index],
  binding: missing("absent", "task_binding", sprintCockpitInput.identities[index].mtTaskID),
  authority: missing("unknown", "runtime_snapshot", sprintCockpitInput.identities[index].mtTaskID),
  execution: missing("absent", "task_execution", sprintCockpitInput.identities[index].mtTaskID),
  attention: missing("unknown", "attention_input", sprintCockpitInput.identities[index].mtTaskID),
})

describe("sprint cockpit mapper", () => {
  test("keeps A and B distinct without converting absent facts into zero", () => {
    const view = mapCockpitView({
      ownership: snapshot([
        {
          identity: sprintCockpitInput.identities[0],
          binding: missing("absent", "task_binding", "DA40-015-A"),
          authority: missing("unknown", "runtime_snapshot", "DA40-015-A"),
          execution: missing("absent", "task_execution", "DA40-015-A"),
          attention: missing("unknown", "attention_input", "DA40-015-A"),
        },
        {
          identity: sprintCockpitInput.identities[1],
          binding: {
            state: "available",
            value: { ...sprintCockpitInput.identities[1], version: 1, time: { created: 1, updated: 1 } },
            provenance: provenance("task_binding", "DA40-015-B"),
            freshness: {},
          },
          authority: {
            state: "available",
            value: { id: "DA40-015-B", state: "available", mtStatus: "todo" },
            provenance: provenance("runtime_snapshot", "DA40-015-B"),
            freshness: {},
          },
          execution: missing("absent", "task_execution", "DA40-015-B"),
          attention: {
            state: "available",
            value: [
              {
                sourceTaskID: "DA40-015-B",
                id: "attn",
                kind: "signal",
                provenance: provenance("attention_input", "DA40-015-B"),
                freshness: {},
              },
            ],
            provenance: provenance("attention_input", "DA40-015-B"),
            freshness: {},
          },
        },
      ]),
    })
    expect(view.tasks.map((task) => task.id)).toEqual(["DA40-015-A", "DA40-015-B"])
    expect(view.tasks[0].worktree.text.includes("0")).toBe(false)
    expect(view.tasks[0].sessionHref).toBeNull()
    expect(view.tasks[1].sessionHref).toBe(
      legacySessionHref(sprintCockpitInput.identities[1].checkout.worktree, sprintCockpitInput.identities[1].sessionID),
    )
    expect(view.tasks[0].worktreeLabel).toEqual({
      text: "features/tasks/DA40-015-candidate-integree",
      state: "available",
      source: "observed",
    })
    expect(view.tasks[1].worktreeLabel.text.startsWith("features/tasks/")).toBe(true)
    expect(view.tasks[1].hasUnread).toBe(true)
    expect(view.tasks[0].hasUnread).toBe(false)
  })

  test("labels an observed features/tasks suffix and tags unknown otherwise", () => {
    expect(worktreeLabelFromPath("/Users/leanbot/Documents/40_Daidalon/features/tasks/DA10-007")).toEqual({
      text: "features/tasks/DA10-007",
      state: "available",
      source: "observed",
    })
    expect(worktreeLabelFromPath("/tmp/other")).toEqual({ text: "unknown", state: "unknown", source: "worktree" })
    expect(worktreeLabelFromPath(undefined)).toEqual({ text: "unknown", state: "unknown", source: "worktree" })
  })

  test("formats unavailable facts as labelled provenance instead of numeric zero", () => {
    expect(formatFact({ state: "invalid", provenance: { source: "repo_config" } })).toEqual({
      text: "invalid (repo_config)",
      state: "invalid",
      source: "repo_config",
    })
    expect(formatFact({ state: "available", value: 0, provenance: { source: "git_rev_list" } }).text).toBe("0")
  })

  test("fallback marks HTTP failure inaccessible and never deep-links", () => {
    const view = inaccessibleCockpitView()
    expect(view.source).toBe("inaccessible")
    expect(view.tasks.map((task) => task.id)).toEqual(["DA40-015-A", "DA40-015-B"])
    expect(view.tasks.every((task) => task.sessionHref === null)).toBe(true)
    expect(view.tasks.every((task) => task.status.state === "inaccessible")).toBe(true)
    expect(view.tasks.every((task) => task.eligibility === "none")).toBe(true)
  })

  test("marks the selected task eligible and the rest waiting on the sequential queue", () => {
    const view = mapCockpitView({
      ownership: snapshot([stubEntry(0), stubEntry(1)], {
        kind: "selected",
        id: "DA40-015-A",
        action: "start_analyze",
      }),
    })
    expect(view.tasks[0].eligibility).toBe("eligible")
    expect(view.tasks[1].eligibility).toBe("waiting")
    expect(view.tasks[1].eligibilityReason).toEqual({ text: "DA40-015-A", state: "available", source: "task_queue" })
    expect(cockpitEligibilityBadge(view.tasks[0].eligibility)).toBe("eligible")
    expect(cockpitEligibilityBadge(view.tasks[1].eligibility)).toBe("blocked")
  })

  test("fail-closes every card when the queue is blocked", () => {
    const view = mapCockpitView({
      ownership: snapshot([stubEntry(0), stubEntry(1)], {
        kind: "blocked",
        reason: "predecessor_not_closed",
      }),
    })
    expect(view.tasks.map((task) => task.eligibility)).toEqual(["blocked", "blocked"])
    expect(view.tasks[0].eligibilityReason.text).toBe("predecessor_not_closed")
    expect(view.tasks.every((task) => cockpitEligibilityBadge(task.eligibility) === "blocked")).toBe(true)
  })

  test("complete queue has no eligible card", () => {
    const view = mapCockpitView({ ownership: snapshot([stubEntry(0), stubEntry(1)]) })
    expect(view.tasks.every((task) => task.eligibility === "none")).toBe(true)
    expect(view.tasks.every((task) => cockpitEligibilityBadge(task.eligibility) === undefined)).toBe(true)
  })
})

describe("sprint cockpit layout", () => {
  test("keeps A/B selection local without mutative callbacks", () => {
    const actions: SensitiveAction[] = ["launch", "commit", "merge", "production"]
    expect(actions.every((action) => typeof action !== "function")).toBe(true)
    const selected = reduceCockpitLayoutState(createCockpitLayoutState(), { type: "selectTask", taskId: "DA40-015-B" })
    expect(selected.selectedTaskId).toBe("DA40-015-B")
    expect(createCockpitLayoutState().selectedTaskId).toBe("DA40-015-A")
  })
})

describe("sprint cockpit launch", () => {
  const task = {
    id: "DA10-007",
    apexExternalRef: ".project/tasks/DA10-007-chat-worktree",
    worktreePath: "/Users/leanbot/Documents/40_Daidalon/features/tasks/DA10-007",
    eligibility: "eligible" as const,
  }

  test("launch calls open once and commit or merge stay inert", async () => {
    const calls: unknown[] = []
    const global = {
      taskChatOpen: async (payload: unknown) => {
        calls.push(payload)
        return { response: { ok: true }, data: { sessionID: "ses_open", created: true } }
      },
    }
    const opened = await confirmCockpitAction({ action: "launch", task, global })
    expect(calls).toHaveLength(1)
    expect(opened).toEqual({
      type: "opened",
      href: legacySessionHref(task.worktreePath, "ses_open"),
    })
    expect(await confirmCockpitAction({ action: "commit", task, global })).toEqual({ type: "simulated" })
    expect(await confirmCockpitAction({ action: "merge", task, global })).toEqual({ type: "simulated" })
    expect(await confirmCockpitAction({ action: "production", task, global })).toEqual({ type: "simulated" })
    expect(calls).toHaveLength(1)
  })

  test("copy states staging-only promotion and refuses force-push and master", () => {
    expect(sprintCockpitInput.repositories[0].mergeTarget).toBe("dev")
    expect(dict["sprint.cockpit.contextNote"]).toContain("staging only")
    expect(dict["sprint.cockpit.contextNote"]).toContain("Force-push")
    expect(dict["sprint.cockpit.contextNote"]).toContain("master/develop")
    expect(dict["sprint.cockpit.confirmationDescription"]).toContain("staging only")
    expect(dict["sprint.cockpit.confirmationDescription"]).toContain("never force-push")
    expect(dict["sprint.cockpit.confirmationDescription"]).toContain("never master or develop")
  })

  test("launch reopen still goes through open without a local session.create", async () => {
    const calls: number[] = []
    const global = {
      taskChatOpen: async () => {
        calls.push(1)
        return { response: { ok: true }, data: { sessionID: "ses_open", created: false } }
      },
    }
    const first = await confirmCockpitAction({ action: "launch", task, global })
    const second = await confirmCockpitAction({ action: "launch", task, global })
    expect(calls).toEqual([1, 1])
    expect(first).toEqual(second)
    expect(first).toMatchObject({ type: "opened", href: legacySessionHref(task.worktreePath, "ses_open") })
  })

  test("launch stays closed when the card is not eligible or the worktree is unknown", async () => {
    const calls: unknown[] = []
    const global = {
      taskChatOpen: async (payload: unknown) => {
        calls.push(payload)
        return { response: { ok: true }, data: { sessionID: "ses_open" } }
      },
    }
    expect(
      await confirmCockpitAction({
        action: "launch",
        task: { ...task, eligibility: "waiting" },
        global,
      }),
    ).toEqual({ type: "failed", message: "unknown" })
    expect(
      await confirmCockpitAction({
        action: "launch",
        task: { ...task, worktreePath: null },
        global,
      }),
    ).toEqual({ type: "failed", message: "unknown" })
    expect(cockpitLaunchEnabled(task)).toBe(true)
    expect(cockpitLaunchEnabled({ ...task, eligibility: "blocked" })).toBe(false)
    expect(calls).toEqual([])
  })
})

describe("sprint cockpit prompt", () => {
  test("builds the collable prompt from observed facts only", () => {
    expect(
      cockpitPromptText({
        id: "DA40-015-A",
        worktreeLabel: { text: "features/tasks/DA40-015-candidate-integree", state: "available" },
        head: { text: "03f621743", state: "available" },
      }),
    ).toBe("Skill apex-task. Carte DA40-015-A. cwd = features/tasks/DA40-015-candidate-integree. Base 03f621743.")
    expect(
      cockpitPromptText({
        id: "DA40-015-A",
        worktreeLabel: { text: "features/tasks/DA40-015-candidate-integree", state: "available" },
        head: { text: "unknown (task_binding)", state: "unknown" },
      }),
    ).toBeNull()
  })
})

describe("sprint cockpit load", () => {
  test("reads ownership then topology then sprint metrics", async () => {
    const calls: string[] = []
    const view = await loadSprintCockpit({
      ownership: async () => {
        calls.push("ownership")
        return { response: { ok: false } }
      },
      topology: async () => {
        calls.push("topology")
        return { response: { ok: false } }
      },
      metrics: async () => {
        calls.push("metrics")
        return { response: { ok: false } }
      },
    } as OpencodeClient["global"])
    expect(calls).toEqual(["ownership"])
    expect(view.source).toBe("inaccessible")
  })
})
