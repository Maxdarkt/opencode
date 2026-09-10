export * as TaskAuthority from "./task-authority"

import { Schema } from "effect"
import { TaskPilot } from "./task-pilot"

export const State = Schema.Literals(["available", "absent", "inaccessible", "invalid", "expired", "divergent"])
export type State = typeof State.Type

export const Observation = Schema.Struct({
  state: State,
  provenance: Schema.Literal("runtime_snapshot"),
  observedAt: Schema.optional(Schema.String),
  expiresAt: Schema.optional(Schema.String),
  generation: Schema.optional(Schema.Finite),
  mtStatus: Schema.optional(TaskPilot.MtStatus),
  apexPhase: Schema.optional(TaskPilot.ApexPhase),
}).annotate({ identifier: "TaskAuthority.Observation" })
export interface Observation extends Schema.Schema.Type<typeof Observation> {}

const Task = Schema.Struct({
  id: Schema.String,
  mtStatus: TaskPilot.MtStatus,
  apex: Schema.Struct({ phase: Schema.String }),
  git: Schema.optional(Schema.Struct({ worktreePath: Schema.String, head: Schema.String })),
})

export const Snapshot = Schema.Struct({
  schemaVersion: Schema.Literal(2),
  generation: Schema.Finite,
  authority: Schema.Struct({
    business: Schema.Literal("mt-tasks"),
    phasesAndEvidence: Schema.Literal("apex-task-folders"),
  }),
  observedAt: Schema.String,
  expiresAt: Schema.String,
  tasks: Schema.Array(Task),
}).annotate({ identifier: "TaskAuthority.Snapshot" })
export interface Snapshot extends Schema.Schema.Type<typeof Snapshot> {}
