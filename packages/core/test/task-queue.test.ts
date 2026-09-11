import { describe, expect, test } from "bun:test"
import { TaskQueue } from "@opencode-ai/core/task-queue"

const entry = (input: {
  id: string
  mtStatus: "todo" | "in_progress" | "review" | "done" | "blocked"
  apexPhase?: "analyze" | "plan" | "build" | "smoke" | "verify"
  context?: "concordant" | "incomplete" | "divergent" | "resuming"
}) => TaskQueue.Entry.make({ ...input, context: input.context ?? "concordant" })

describe("TaskQueue", () => {
  test("selects the active task and never transfers its action to the next task", () => {
    expect(
      TaskQueue.evaluate([
        entry({ id: "A", mtStatus: "in_progress", apexPhase: "build" }),
        entry({ id: "B", mtStatus: "todo" }),
      ]),
    ).toEqual({ kind: "selected", id: "A", action: "run_smoke" })
  })

  test("selects B after A is closed at verify", () => {
    expect(
      TaskQueue.evaluate([
        entry({ id: "A", mtStatus: "review", apexPhase: "verify" }),
        entry({ id: "B", mtStatus: "todo" }),
      ]),
    ).toEqual({ kind: "selected", id: "B", action: "start_analyze" })
    expect(
      TaskQueue.evaluate([
        entry({ id: "A", mtStatus: "done", apexPhase: "verify" }),
        entry({ id: "B", mtStatus: "in_progress", apexPhase: "analyze" }),
      ]),
    ).toEqual({ kind: "selected", id: "B", action: "write_plan" })
  })

  test("is complete when all tasks are closed", () => {
    expect(
      TaskQueue.evaluate([
        entry({ id: "A", mtStatus: "done", apexPhase: "verify" }),
        entry({ id: "B", mtStatus: "review", apexPhase: "verify" }),
      ]),
    ).toEqual({ kind: "complete" })
  })

  test("fails closed for malformed order and duplicate identities", () => {
    expect(TaskQueue.evaluate([])).toEqual({ kind: "blocked", reason: "empty_queue" })
    expect(
      TaskQueue.evaluate([entry({ id: "A", mtStatus: "todo" }), entry({ id: "A", mtStatus: "todo" })]),
    ).toEqual({ kind: "blocked", reason: "duplicate_task_id" })
    expect(
      TaskQueue.evaluate([
        entry({ id: "A", mtStatus: "todo" }),
        entry({ id: "B", mtStatus: "in_progress", apexPhase: "analyze" }),
      ]),
    ).toEqual({ kind: "blocked", reason: "predecessor_not_closed" })
    expect(
      TaskQueue.evaluate([
        entry({ id: "A", mtStatus: "in_progress", apexPhase: "analyze" }),
        entry({ id: "B", mtStatus: "in_progress", apexPhase: "analyze" }),
      ]),
    ).toEqual({ kind: "blocked", reason: "multiple_active" })
    expect(
      TaskQueue.evaluate([
        entry({ id: "A", mtStatus: "in_progress", apexPhase: "analyze" }),
        entry({ id: "B", mtStatus: "done", apexPhase: "verify" }),
      ]),
    ).toEqual({ kind: "blocked", reason: "out_of_order" })
  })

  test("fails closed for invalid status and phase combinations", () => {
    expect(TaskQueue.evaluate([entry({ id: "A", mtStatus: "todo", apexPhase: "plan" })])).toEqual({
      kind: "blocked",
      reason: "invalid_status_phase",
    })
    expect(TaskQueue.evaluate([entry({ id: "A", mtStatus: "review", apexPhase: "build" })])).toEqual({
      kind: "blocked",
      reason: "invalid_status_phase",
    })
    expect(TaskQueue.evaluate([entry({ id: "A", mtStatus: "todo", context: "incomplete" })])).toEqual({
      kind: "blocked",
      reason: "context_incomplete",
    })
  })

  test("is deterministic when replayed", () => {
    const input = [entry({ id: "A", mtStatus: "review", apexPhase: "verify" }), entry({ id: "B", mtStatus: "todo" })]
    expect(TaskQueue.evaluate(input)).toEqual(TaskQueue.evaluate(input))
  })
})
