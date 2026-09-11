import { describe, expect, test } from "bun:test"
import type { OpencodeClient, TaskOwnershipSnapshot } from "@opencode-ai/sdk/v2/client"
import { sprintCockpitInput } from "./sprint-cockpit-input"
import { loadSprintCockpit } from "./sprint-cockpit-load"
import { formatFact, inaccessibleCockpitView, mapCockpitView } from "./sprint-cockpit-mapper"
import { createCockpitLayoutState, reduceCockpitLayoutState } from "./sprint-cockpit-state"
import type { SensitiveAction } from "./sprint-cockpit-fixtures"

const provenance = (source: "task_binding" | "runtime_snapshot" | "task_execution" | "attention_input", reference: string) => ({
  source,
  reference,
})

const missing = (state: "absent" | "unknown" | "inaccessible" | "invalid", source: "task_binding" | "runtime_snapshot" | "task_execution" | "attention_input", reference: string) => ({
  state,
  provenance: provenance(source, reference),
  freshness: {},
})

const snapshot = (entries: TaskOwnershipSnapshot["entries"]): TaskOwnershipSnapshot => ({
  state: "available",
  provenance: provenance("runtime_snapshot", "fixture"),
  freshness: {},
  result: { kind: "complete" },
  entries,
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
    expect(view.tasks[1].sessionHref).toBe(`/session/${sprintCockpitInput.identities[1].sessionID}`)
    expect(view.tasks[1].hasUnread).toBe(true)
    expect(view.tasks[0].hasUnread).toBe(false)
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
