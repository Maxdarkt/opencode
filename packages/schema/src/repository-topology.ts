export * as RepositoryTopology from "./repository-topology"

import { Schema } from "effect"
import { NonNegativeInt, optional } from "./schema"
import { TaskOwnership } from "./task-ownership"

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
]).annotate({ identifier: "RepositoryTopology.State" })
export type State = typeof State.Type

export const Unavailable = Schema.Literals([
  "absent",
  "inaccessible",
  "invalid",
  "expired",
  "divergent",
  "blocked",
  "unknown",
]).annotate({ identifier: "RepositoryTopology.Unavailable" })
export type Unavailable = typeof Unavailable.Type

export const Source = Schema.Literals([
  "repo_config",
  "git_worktree_list",
  "git_rev_parse",
  "git_status",
  "git_rev_list",
  "git_diff",
  "git_show_ref",
  "task_ownership",
]).annotate({ identifier: "RepositoryTopology.Source" })
export type Source = typeof Source.Type

export interface Provenance extends Schema.Schema.Type<typeof Provenance> {}
export const Provenance = Schema.Struct({
  source: Source,
  reference: NonEmptyString,
}).annotate({ identifier: "RepositoryTopology.Provenance" })

export interface Freshness extends Schema.Schema.Type<typeof Freshness> {}
export const Freshness = Schema.Struct({
  observedAt: optional(Schema.String),
  expiresAt: optional(Schema.String),
  generation: optional(Schema.Finite),
}).annotate({ identifier: "RepositoryTopology.Freshness" })

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

export const StringFact = Schema.Union([availableFact(NonEmptyString), unavailableFact]).annotate({
  identifier: "RepositoryTopology.StringFact",
})
export type StringFact = typeof StringFact.Type

export const CountFact = Schema.Union([availableFact(NonNegativeInt), unavailableFact]).annotate({
  identifier: "RepositoryTopology.CountFact",
})
export type CountFact = typeof CountFact.Type

export const BooleanFact = Schema.Union([availableFact(Schema.Boolean), unavailableFact]).annotate({
  identifier: "RepositoryTopology.BooleanFact",
})
export type BooleanFact = typeof BooleanFact.Type

export const Cleanliness = Schema.Literals(["clean", "modified", "unknown"]).annotate({
  identifier: "RepositoryTopology.Cleanliness",
})
export type Cleanliness = typeof Cleanliness.Type

export const CleanlinessFact = Schema.Union([availableFact(Cleanliness), unavailableFact]).annotate({
  identifier: "RepositoryTopology.CleanlinessFact",
})
export type CleanlinessFact = typeof CleanlinessFact.Type

export interface DiffStats extends Schema.Schema.Type<typeof DiffStats> {}
export const DiffStats = Schema.Struct({
  additions: NonNegativeInt,
  deletions: NonNegativeInt,
  modifiedFiles: NonNegativeInt,
}).annotate({ identifier: "RepositoryTopology.DiffStats" })

export const DiffFact = Schema.Union([availableFact(DiffStats), unavailableFact]).annotate({
  identifier: "RepositoryTopology.DiffFact",
})
export type DiffFact = typeof DiffFact.Type

export interface TaskLink extends Schema.Schema.Type<typeof TaskLink> {}
export const TaskLink = Schema.Struct({
  mtTaskID: NonEmptyString,
}).annotate({ identifier: "RepositoryTopology.TaskLink" })

export const TaskFact = Schema.Union([availableFact(TaskLink), unavailableFact]).annotate({
  identifier: "RepositoryTopology.TaskFact",
})
export type TaskFact = typeof TaskFact.Type

export const Presence = Schema.Literal("present").annotate({
  identifier: "RepositoryTopology.Presence",
})
export type Presence = typeof Presence.Type

export const PresenceFact = Schema.Union([availableFact(Presence), unavailableFact]).annotate({
  identifier: "RepositoryTopology.PresenceFact",
})
export type PresenceFact = typeof PresenceFact.Type

export interface RepositoryInput extends Schema.Schema.Type<typeof RepositoryInput> {}
export const RepositoryInput = Schema.Struct({
  root: NonEmptyString,
  sourceRefs: Schema.Array(NonEmptyString),
  mergeTarget: Schema.String,
}).annotate({ identifier: "RepositoryTopology.RepositoryInput" })

export interface Input extends Schema.Schema.Type<typeof Input> {}
export const Input = Schema.Struct({
  ownership: TaskOwnership.Snapshot,
  repositories: Schema.Array(RepositoryInput),
}).annotate({ identifier: "RepositoryTopology.Input" })

export interface Branch extends Schema.Schema.Type<typeof Branch> {}
export const Branch = Schema.Struct({
  name: NonEmptyString,
  presence: PresenceFact,
}).annotate({ identifier: "RepositoryTopology.Branch" })

export interface Worktree extends Schema.Schema.Type<typeof Worktree> {}
export const Worktree = Schema.Struct({
  path: StringFact,
  branch: StringFact,
  head: StringFact,
  mergeTarget: StringFact,
  cleanliness: CleanlinessFact,
  ahead: CountFact,
  behind: CountFact,
  workingTreeDiff: DiffFact,
  integrationDiff: DiffFact,
  task: TaskFact,
  prunable: BooleanFact,
}).annotate({ identifier: "RepositoryTopology.Worktree" })

export interface Repository extends Schema.Schema.Type<typeof Repository> {}
export const Repository = Schema.Struct({
  sourceRepo: StringFact,
  branches: Schema.Array(Branch),
  worktrees: Schema.Array(Worktree),
}).annotate({ identifier: "RepositoryTopology.Repository" })

export interface Snapshot extends Schema.Schema.Type<typeof Snapshot> {}
export const Snapshot = Schema.Struct({
  state: State,
  provenance: Provenance,
  freshness: Freshness,
  repositories: Schema.Array(Repository),
}).annotate({ identifier: "RepositoryTopology.Snapshot" })
