export * as TaskQueue from "./task-queue"

import { Schema } from "effect"
import { TaskPilot } from "./task-pilot"

const NonEmptyString = Schema.String.check(Schema.isNonEmpty())

export const BlockReason = Schema.Literals([
  "empty_queue",
  "duplicate_task_id",
  "invalid_status_phase",
  "multiple_active",
  "predecessor_not_closed",
  "out_of_order",
  "context_incomplete",
  "context_divergent",
  "execution_resuming",
  "mt_blocked",
]).annotate({ identifier: "TaskQueue.BlockReason" })
export type BlockReason = typeof BlockReason.Type

export interface Entry extends Schema.Schema.Type<typeof Entry> {}
export const Entry = Schema.Struct({
  id: NonEmptyString,
  mtStatus: TaskPilot.MtStatus,
  apexPhase: Schema.optional(TaskPilot.ApexPhase),
  context: TaskPilot.Context,
}).annotate({ identifier: "TaskQueue.Entry" })

export interface Selected extends Schema.Schema.Type<typeof Selected> {}
export const Selected = Schema.Struct({
  kind: Schema.Literal("selected"),
  id: NonEmptyString,
  action: TaskPilot.Action,
}).annotate({ identifier: "TaskQueue.Selected" })

export interface Complete extends Schema.Schema.Type<typeof Complete> {}
export const Complete = Schema.Struct({ kind: Schema.Literal("complete") }).annotate({
  identifier: "TaskQueue.Complete",
})

export interface Blocked extends Schema.Schema.Type<typeof Blocked> {}
export const Blocked = Schema.Struct({
  kind: Schema.Literal("blocked"),
  reason: BlockReason,
}).annotate({ identifier: "TaskQueue.Blocked" })

export type Result = typeof Result.Type
export const Result = Schema.Union([Selected, Complete, Blocked]).annotate({ identifier: "TaskQueue.Result" })
