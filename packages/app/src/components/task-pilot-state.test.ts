import { expect, test } from "bun:test"
import { evaluateTaskPilot, hasTaskPilotIdentity, type TaskPilotObservation } from "./task-pilot-state"

const concordant = (input: Omit<TaskPilotObservation, "context">): TaskPilotObservation => ({
  ...input,
  context: "concordant",
})

test("evaluates every admitted DA30-006 status and phase pair", () => {
  const cases = [
    [concordant({ mtStatus: "todo" }), "start_analyze"],
    [concordant({ mtStatus: "in_progress", apexPhase: "analyze" }), "write_plan"],
    [concordant({ mtStatus: "in_progress", apexPhase: "plan" }), "start_build"],
    [concordant({ mtStatus: "in_progress", apexPhase: "build" }), "run_smoke"],
    [concordant({ mtStatus: "in_progress", apexPhase: "smoke" }), "verify"],
    [concordant({ mtStatus: "in_progress", apexPhase: "verify" }), "request_review"],
    [concordant({ mtStatus: "review", apexPhase: "verify" }), "parent_close"],
    [concordant({ mtStatus: "done", apexPhase: "verify" }), "parent_close"],
  ] as const

  for (const [input, action] of cases) expect(evaluateTaskPilot(input)).toEqual({ kind: "next", action })
})

test("fails closed without an observation and for invalid status and phase pairs", () => {
  expect(evaluateTaskPilot()).toEqual({ kind: "blocked", reason: "context_incomplete" })

  for (const input of [
    concordant({ mtStatus: "todo", apexPhase: "plan" }),
    concordant({ mtStatus: "review", apexPhase: "build" }),
    concordant({ mtStatus: "done", apexPhase: "smoke" }),
    concordant({ mtStatus: "in_progress" }),
  ]) {
    expect(evaluateTaskPilot(input)).toEqual({ kind: "blocked", reason: "invalid_status_phase" })
  }
})

test("gives context blocks priority over otherwise admitted observations", () => {
  for (const [context, reason] of [
    ["incomplete", "context_incomplete"],
    ["divergent", "context_divergent"],
    ["resuming", "execution_resuming"],
  ] as const) {
    expect(evaluateTaskPilot({ mtStatus: "in_progress", apexPhase: "verify", context })).toEqual({
      kind: "blocked",
      reason,
    })
  }
})

test("returns the same result without changing an optional local identity", () => {
  const observation = concordant({ mtStatus: "in_progress", apexPhase: "build" })
  expect(evaluateTaskPilot(observation)).toEqual(evaluateTaskPilot(observation))
  expect(hasTaskPilotIdentity()).toBeFalse()
  expect(hasTaskPilotIdentity({ sessionID: "ses_task" })).toBeFalse()
  expect(hasTaskPilotIdentity({ sessionID: "ses_task", worktree: "/repo/task" })).toBeTrue()
})
