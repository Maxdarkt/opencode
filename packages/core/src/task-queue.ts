export * as TaskQueue from "./task-queue"

import { TaskQueue as Contract } from "@opencode-ai/schema/task-queue"
import { TaskPilot } from "./task-pilot"

export const BlockReason = Contract.BlockReason
export type BlockReason = Contract.BlockReason

export const Entry = Contract.Entry
export type Entry = Contract.Entry

export const Result = Contract.Result
export type Result = Contract.Result

const blocked = (reason: BlockReason): Result => Contract.Blocked.make({ kind: "blocked", reason })

const isClosed = (entry: Entry) =>
  (entry.mtStatus === "review" || entry.mtStatus === "done") && entry.apexPhase === "verify"

const isTodo = (entry: Entry) => entry.mtStatus === "todo" && entry.apexPhase === undefined

export function evaluate(entries: ReadonlyArray<Entry>): Result {
  if (!entries.length) return blocked("empty_queue")

  const ids = new Set<string>()
  for (const entry of entries) {
    if (ids.has(entry.id)) return blocked("duplicate_task_id")
    ids.add(entry.id)
  }

  let selected: Contract.Selected | undefined
  let selectedFromTodo = false

  for (const [index, entry] of entries.entries()) {
    if (isClosed(entry)) {
      if (selected) return blocked(selectedFromTodo ? "predecessor_not_closed" : "out_of_order")
      continue
    }

    const pilot = TaskPilot.evaluate(
      TaskPilot.Input.make({
        mtStatus: entry.mtStatus,
        ...(entry.apexPhase ? { apexPhase: entry.apexPhase } : {}),
        context: entry.context,
      }),
    )
    if (pilot.kind === "blocked") return blocked(pilot.reason)

    if (selected) {
      if (selectedFromTodo) return blocked("predecessor_not_closed")
      if (isTodo(entry)) continue
      if (entry.mtStatus === "in_progress") return blocked("multiple_active")
      return blocked("out_of_order")
    }

    selected = Contract.Selected.make({ kind: "selected", id: entry.id, action: pilot.action })
    selectedFromTodo = isTodo(entry)

    if (index === entries.length - 1) return selected
  }

  return selected ?? Contract.Complete.make({ kind: "complete" })
}
