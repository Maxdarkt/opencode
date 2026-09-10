export * as TaskPilot from "./task-pilot"

import { Schema } from "effect"

export const ApexPhase = Schema.Literals(["analyze", "plan", "build", "smoke", "verify"]).annotate({
  identifier: "TaskPilot.ApexPhase",
})
export type ApexPhase = typeof ApexPhase.Type

export const MtStatus = Schema.Literals(["todo", "in_progress", "review", "done", "blocked"]).annotate({
  identifier: "TaskPilot.MtStatus",
})
export type MtStatus = typeof MtStatus.Type

export const Context = Schema.Literals(["concordant", "incomplete", "divergent", "resuming"]).annotate({
  identifier: "TaskPilot.Context",
})
export type Context = typeof Context.Type

export const Action = Schema.Literals([
  "start_analyze",
  "write_plan",
  "start_build",
  "run_smoke",
  "verify",
  "request_review",
  "parent_close",
]).annotate({ identifier: "TaskPilot.Action" })
export type Action = typeof Action.Type

export const BlockReason = Schema.Literals([
  "context_incomplete",
  "context_divergent",
  "execution_resuming",
  "mt_blocked",
  "invalid_status_phase",
]).annotate({ identifier: "TaskPilot.BlockReason" })
export type BlockReason = typeof BlockReason.Type

export interface Input extends Schema.Schema.Type<typeof Input> {}
export const Input = Schema.Struct({
  mtStatus: MtStatus,
  apexPhase: Schema.optional(ApexPhase),
  context: Context,
}).annotate({ identifier: "TaskPilot.Input" })

export interface Next extends Schema.Schema.Type<typeof Next> {}
export const Next = Schema.Struct({
  kind: Schema.Literal("next"),
  action: Action,
}).annotate({ identifier: "TaskPilot.Next" })

export interface Blocked extends Schema.Schema.Type<typeof Blocked> {}
export const Blocked = Schema.Struct({
  kind: Schema.Literal("blocked"),
  reason: BlockReason,
}).annotate({ identifier: "TaskPilot.Blocked" })

export type Result = typeof Result.Type
export const Result = Schema.Union([Next, Blocked]).annotate({ identifier: "TaskPilot.Result" })
