export * as TaskExecution from "./task-execution"

import { Schema } from "effect"
import { AbsolutePath } from "./schema"
import { Session } from "./session"

const NonEmptyString = Schema.String.check(Schema.isNonEmpty())

export const OwnerID = NonEmptyString.annotate({ identifier: "TaskExecution.OwnerID" })
export type OwnerID = typeof OwnerID.Type

export const EffectID = NonEmptyString.annotate({ identifier: "TaskExecution.EffectID" })
export type EffectID = typeof EffectID.Type

export const Generation = Schema.Int.check(Schema.isGreaterThanOrEqualTo(1)).annotate({
  identifier: "TaskExecution.Generation",
})
export type Generation = typeof Generation.Type

export const Field = Schema.Literals(["mtTaskID", "sessionID", "worktree", "ownerID", "generation"]).annotate({
  identifier: "TaskExecution.Field",
})
export type Field = typeof Field.Type

export interface Token extends Schema.Schema.Type<typeof Token> {}
export const Token = Schema.Struct({
  mtTaskID: NonEmptyString,
  sessionID: Session.ID,
  worktree: AbsolutePath,
  ownerID: OwnerID,
  generation: Generation,
}).annotate({ identifier: "TaskExecution.Token" })

export const EffectState = Schema.Literals(["pending", "confirmed"]).annotate({
  identifier: "TaskExecution.EffectState",
})
export type EffectState = typeof EffectState.Type

export interface EffectInfo extends Schema.Schema.Type<typeof EffectInfo> {}
export const EffectInfo = Schema.Struct({
  effectID: EffectID,
  state: EffectState,
}).annotate({ identifier: "TaskExecution.EffectInfo" })

export interface Snapshot extends Schema.Schema.Type<typeof Snapshot> {}
export const Snapshot = Schema.Struct({
  ...Token.fields,
  effects: Schema.Array(EffectInfo),
}).annotate({ identifier: "TaskExecution.Snapshot" })

export const BeginDecision = Schema.Literals(["execute", "confirmed"]).annotate({
  identifier: "TaskExecution.BeginDecision",
})
export type BeginDecision = typeof BeginDecision.Type

export const ResolutionState = Schema.Literals(["confirmed", "absent", "uncertain"]).annotate({
  identifier: "TaskExecution.ResolutionState",
})
export type ResolutionState = typeof ResolutionState.Type

export interface Resolution extends Schema.Schema.Type<typeof Resolution> {}
export const Resolution = Schema.Struct({
  effectID: EffectID,
  state: ResolutionState,
}).annotate({ identifier: "TaskExecution.Resolution" })
