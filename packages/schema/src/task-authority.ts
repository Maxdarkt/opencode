export * as TaskAuthority from "./task-authority"

import { Schema } from "effect"
import { TaskBinding } from "./task-binding"
import { TaskPilot } from "./task-pilot"
import { TaskQueue } from "./task-queue"

export const State = Schema.Literals([
  "available",
  "absent",
  "inaccessible",
  "invalid",
  "expired",
  "divergent",
])
export type State = typeof State.Type

export const QueueState = Schema.Literals([
  "available",
  "absent",
  "inaccessible",
  "invalid",
  "expired",
  "divergent",
  "blocked",
])
export type QueueState = typeof QueueState.Type

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

export interface QueueInputEntry extends Schema.Schema.Type<typeof QueueInputEntry> {}
export const QueueInputEntry = Schema.Struct({ identity: TaskBinding.Identity }).annotate({
  identifier: "TaskAuthority.QueueInputEntry",
})

export interface QueueInput extends Schema.Schema.Type<typeof QueueInput> {}
export const QueueInput = Schema.Struct({
  entries: Schema.Array(QueueInputEntry),
  snapshotPath: Schema.optional(Schema.String),
}).annotate({ identifier: "TaskAuthority.QueueInput" })

export interface QueueEntryObservation extends Schema.Schema.Type<typeof QueueEntryObservation> {}
export const QueueEntryObservation = Schema.Struct({
  id: Schema.String,
  state: State,
  mtStatus: Schema.optional(TaskPilot.MtStatus),
  apexPhase: Schema.optional(TaskPilot.ApexPhase),
}).annotate({ identifier: "TaskAuthority.QueueEntryObservation" })

export interface QueueObservation extends Schema.Schema.Type<typeof QueueObservation> {}
export const QueueObservation = Schema.Struct({
  state: QueueState,
  provenance: Schema.Literal("runtime_snapshot"),
  observedAt: Schema.optional(Schema.String),
  expiresAt: Schema.optional(Schema.String),
  generation: Schema.optional(Schema.Finite),
  entries: Schema.Array(QueueEntryObservation),
  result: TaskQueue.Result,
}).annotate({ identifier: "TaskAuthority.QueueObservation" })
