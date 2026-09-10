import { describe, expect, test } from "bun:test"
import { TaskPilot } from "@opencode-ai/core/task-pilot"

describe("TaskPilot", () => {
  test("evaluates every admitted lifecycle state", () => {
    const cases = [
      [{ mtStatus: "todo", context: "concordant" }, "start_analyze"],
      [{ mtStatus: "in_progress", apexPhase: "analyze", context: "concordant" }, "write_plan"],
      [{ mtStatus: "in_progress", apexPhase: "plan", context: "concordant" }, "start_build"],
      [{ mtStatus: "in_progress", apexPhase: "build", context: "concordant" }, "run_smoke"],
      [{ mtStatus: "in_progress", apexPhase: "smoke", context: "concordant" }, "verify"],
      [{ mtStatus: "in_progress", apexPhase: "verify", context: "concordant" }, "request_review"],
      [{ mtStatus: "review", apexPhase: "verify", context: "concordant" }, "parent_close"],
      [{ mtStatus: "done", apexPhase: "verify", context: "concordant" }, "parent_close"],
    ] as const

    for (const [input, action] of cases)
      expect(TaskPilot.evaluate(TaskPilot.Input.make(input))).toEqual({ kind: "next", action })
  })

  test("prioritizes context and MT blocks", () => {
    expect(
      TaskPilot.evaluate(TaskPilot.Input.make({ mtStatus: "in_progress", apexPhase: "build", context: "incomplete" })),
    ).toEqual({
      kind: "blocked",
      reason: "context_incomplete",
    })
    expect(
      TaskPilot.evaluate(TaskPilot.Input.make({ mtStatus: "in_progress", apexPhase: "build", context: "divergent" })),
    ).toEqual({
      kind: "blocked",
      reason: "context_divergent",
    })
    expect(
      TaskPilot.evaluate(TaskPilot.Input.make({ mtStatus: "in_progress", apexPhase: "build", context: "resuming" })),
    ).toEqual({
      kind: "blocked",
      reason: "execution_resuming",
    })
    expect(
      TaskPilot.evaluate(TaskPilot.Input.make({ mtStatus: "blocked", apexPhase: "build", context: "concordant" })),
    ).toEqual({
      kind: "blocked",
      reason: "mt_blocked",
    })
  })

  test("fails closed and is idempotent", () => {
    const invalid = TaskPilot.Input.make({ mtStatus: "review", apexPhase: "build", context: "concordant" })
    expect(TaskPilot.evaluate(invalid)).toEqual({ kind: "blocked", reason: "invalid_status_phase" })
    expect(
      TaskPilot.evaluate(TaskPilot.Input.make({ mtStatus: "todo", apexPhase: "plan", context: "concordant" })),
    ).toEqual({
      kind: "blocked",
      reason: "invalid_status_phase",
    })
    expect(TaskPilot.evaluate(invalid)).toEqual(TaskPilot.evaluate(invalid))
  })
})
