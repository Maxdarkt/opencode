export * as TaskOwnership from "./task-ownership"

import { Schema } from "effect"
import { optional } from "./schema"
import { TaskAuthority } from "./task-authority"
import { TaskBinding } from "./task-binding"
import { TaskExecution } from "./task-execution"
import { TaskQueue } from "./task-queue"

const NonEmptyString = Schema.String.check(Schema.isNonEmpty())

export const State = Schema.Literals([
  "available",
  "absent",
  "inaccessible",
  "invalid",
  "expired",
  "divergent",
  "blocked",
  "unknown",
]).annotate({ identifier: "TaskOwnership.State" })
export type State = typeof State.Type

export const Unavailable = Schema.Literals([
  "absent",
  "inaccessible",
  "invalid",
  "expired",
  "divergent",
  "blocked",
  "unknown",
]).annotate({ identifier: "TaskOwnership.Unavailable" })
export type Unavailable = typeof Unavailable.Type

export const Source = Schema.Literals([
  "task_binding",
  "runtime_snapshot",
  "task_execution",
  "attention_input",
]).annotate({ identifier: "TaskOwnership.Source" })
export type Source = typeof Source.Type

export interface Provenance extends Schema.Schema.Type<typeof Provenance> {}
export const Provenance = Schema.Struct({
  source: Source,
  reference: NonEmptyString,
}).annotate({ identifier: "TaskOwnership.Provenance" })

export interface Freshness extends Schema.Schema.Type<typeof Freshness> {}
export const Freshness = Schema.Struct({
  observedAt: optional(Schema.String),
  expiresAt: optional(Schema.String),
  generation: optional(Schema.Finite),
}).annotate({ identifier: "TaskOwnership.Freshness" })

const availableFact = <S extends Schema.Top>(value: S) =>
  Schema.Struct({
    state: Schema.Literal("available"),
    value,
    provenance: Provenance,
    freshness: Freshness,
  })

const unavailableFact = Schema.Struct({
  state: Unavailable,
  provenance: Provenance,
  freshness: Freshness,
})

export const BindingFact = Schema.Union([availableFact(TaskBinding.Info), unavailableFact]).annotate({
  identifier: "TaskOwnership.BindingFact",
})
export type BindingFact = typeof BindingFact.Type

export const AuthorityFact = Schema.Union([
  availableFact(TaskAuthority.QueueEntryObservation),
  unavailableFact,
]).annotate({ identifier: "TaskOwnership.AuthorityFact" })
export type AuthorityFact = typeof AuthorityFact.Type

export const ExecutionFact = Schema.Union([availableFact(TaskExecution.Snapshot), unavailableFact]).annotate({
  identifier: "TaskOwnership.ExecutionFact",
})
export type ExecutionFact = typeof ExecutionFact.Type

export interface Attention extends Schema.Schema.Type<typeof Attention> {}
export const Attention = Schema.Struct({
  sourceTaskID: NonEmptyString,
  id: NonEmptyString,
  kind: NonEmptyString,
  provenance: Provenance,
  freshness: Freshness,
}).annotate({ identifier: "TaskOwnership.Attention" })

export const AttentionFact = Schema.Union([availableFact(Schema.Array(Attention)), unavailableFact]).annotate({
  identifier: "TaskOwnership.AttentionFact",
})
export type AttentionFact = typeof AttentionFact.Type

export interface EntryInput extends Schema.Schema.Type<typeof EntryInput> {}
export const EntryInput = Schema.Struct({
  identity: TaskBinding.Identity,
  attention: optional(Schema.Array(Attention)),
}).annotate({ identifier: "TaskOwnership.EntryInput" })

export interface Input extends Schema.Schema.Type<typeof Input> {}
export const Input = Schema.Struct({
  entries: Schema.Array(EntryInput),
  snapshotPath: optional(Schema.String),
}).annotate({ identifier: "TaskOwnership.Input" })

export interface Entry extends Schema.Schema.Type<typeof Entry> {}
export const Entry = Schema.Struct({
  identity: TaskBinding.Identity,
  binding: BindingFact,
  authority: AuthorityFact,
  execution: ExecutionFact,
  attention: AttentionFact,
}).annotate({ identifier: "TaskOwnership.Entry" })

export interface Snapshot extends Schema.Schema.Type<typeof Snapshot> {}
export const Snapshot = Schema.Struct({
  state: State,
  provenance: Provenance,
  freshness: Freshness,
  result: TaskQueue.Result,
  entries: Schema.Array(Entry),
}).annotate({ identifier: "TaskOwnership.Snapshot" })
