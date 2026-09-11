export * as TaskOwnership from "./task-ownership"

import { Cause, Context, Effect, Exit, Layer, Option } from "effect"
import { TaskOwnership } from "@opencode-ai/schema/task-ownership"
import { TaskQueue } from "@opencode-ai/schema/task-queue"
import { makeGlobalNode } from "./effect/app-node"
import { TaskAuthority } from "./task-authority"
import { TaskBinding } from "./task-binding"
import { TaskExecution } from "./task-execution"

export const State = TaskOwnership.State
export type State = TaskOwnership.State

export const Unavailable = TaskOwnership.Unavailable
export type Unavailable = TaskOwnership.Unavailable

export const Source = TaskOwnership.Source
export type Source = TaskOwnership.Source

export const Provenance = TaskOwnership.Provenance
export type Provenance = TaskOwnership.Provenance

export const Freshness = TaskOwnership.Freshness
export type Freshness = TaskOwnership.Freshness

export const BindingFact = TaskOwnership.BindingFact
export type BindingFact = TaskOwnership.BindingFact

export const AuthorityFact = TaskOwnership.AuthorityFact
export type AuthorityFact = TaskOwnership.AuthorityFact

export const ExecutionFact = TaskOwnership.ExecutionFact
export type ExecutionFact = TaskOwnership.ExecutionFact

export const Attention = TaskOwnership.Attention
export type Attention = TaskOwnership.Attention

export const AttentionFact = TaskOwnership.AttentionFact
export type AttentionFact = TaskOwnership.AttentionFact

export const EntryInput = TaskOwnership.EntryInput
export type EntryInput = TaskOwnership.EntryInput

export const Input = TaskOwnership.Input
export type Input = TaskOwnership.Input

export const Entry = TaskOwnership.Entry
export type Entry = TaskOwnership.Entry

export const Snapshot = TaskOwnership.Snapshot
export type Snapshot = TaskOwnership.Snapshot

export interface Interface {
  readonly read: (input: Input) => Effect.Effect<Snapshot>
}

export class Service extends Context.Service<Service, Interface>()("@opencode/TaskOwnership") {}

const freshness = (input: { observedAt?: string; expiresAt?: string; generation?: number } = {}) =>
  TaskOwnership.Freshness.make({
    ...(input.observedAt === undefined ? {} : { observedAt: input.observedAt }),
    ...(input.expiresAt === undefined ? {} : { expiresAt: input.expiresAt }),
    ...(input.generation === undefined ? {} : { generation: input.generation }),
  })

const provenance = (source: Source, reference: string) => TaskOwnership.Provenance.make({ source, reference })

const queueMeta = (queue: TaskAuthority.QueueObservation) => ({
  observedAt: queue.observedAt,
  expiresAt: queue.expiresAt,
  generation: queue.generation,
})

const missing = (
  state: Unavailable,
  source: Source,
  reference: string,
  observed?: { observedAt?: string; expiresAt?: string; generation?: number },
) => ({
  state,
  provenance: provenance(source, reference),
  freshness: freshness(observed),
})

const bindingFact = (identity: TaskBinding.Identity, outcome: Exit.Exit<TaskBinding.Info, unknown>) => {
  if (Exit.isSuccess(outcome))
    return TaskOwnership.BindingFact.make({
      state: "available",
      value: outcome.value,
      provenance: provenance("task_binding", identity.mtTaskID),
      freshness: freshness(),
    })
  const error = Option.getOrUndefined(Cause.findErrorOption(outcome.cause))
  if (error instanceof TaskBinding.NotFoundError || error instanceof TaskBinding.SessionNotFoundError)
    return TaskOwnership.BindingFact.make(missing("absent", "task_binding", identity.mtTaskID))
  if (error instanceof TaskBinding.ConflictError)
    return TaskOwnership.BindingFact.make(missing("divergent", "task_binding", identity.mtTaskID))
  return TaskOwnership.BindingFact.make(missing("inaccessible", "task_binding", identity.mtTaskID))
}

const authorityFact = (identity: TaskBinding.Identity, queue: TaskAuthority.QueueObservation) => {
  const observed = queue.entries.find((entry) => entry.id === identity.mtTaskID)
  const meta = queueMeta(queue)
  if (observed?.state === "available")
    return TaskOwnership.AuthorityFact.make({
      state: "available",
      value: observed,
      provenance: provenance("runtime_snapshot", identity.mtTaskID),
      freshness: freshness(meta),
    })
  if (observed)
    return TaskOwnership.AuthorityFact.make(missing(observed.state, "runtime_snapshot", identity.mtTaskID, meta))
  if (queue.state === "available" || queue.state === "blocked")
    return TaskOwnership.AuthorityFact.make(missing("absent", "runtime_snapshot", identity.mtTaskID, meta))
  return TaskOwnership.AuthorityFact.make(missing(queue.state, "runtime_snapshot", identity.mtTaskID, meta))
}

const executionFact = (identity: TaskBinding.Identity, snapshot: TaskExecution.Snapshot | undefined) => {
  if (!snapshot)
    return TaskOwnership.ExecutionFact.make(missing("absent", "task_execution", identity.mtTaskID))
  if (
    snapshot.mtTaskID !== identity.mtTaskID ||
    snapshot.sessionID !== identity.sessionID ||
    snapshot.worktree !== identity.checkout.worktree
  )
    return TaskOwnership.ExecutionFact.make(missing("divergent", "task_execution", identity.mtTaskID))
  return TaskOwnership.ExecutionFact.make({
    state: "available",
    value: snapshot,
    provenance: provenance("task_execution", identity.mtTaskID),
    freshness: freshness(),
  })
}

const attentionFact = (input: TaskOwnership.EntryInput) => {
  if (input.attention === undefined)
    return TaskOwnership.AttentionFact.make(missing("unknown", "attention_input", input.identity.mtTaskID))
  if (input.attention.some((item) => item.sourceTaskID !== input.identity.mtTaskID))
    return TaskOwnership.AttentionFact.make(missing("invalid", "attention_input", input.identity.mtTaskID))
  return TaskOwnership.AttentionFact.make({
    state: "available",
    value: input.attention,
    provenance: provenance("attention_input", input.identity.mtTaskID),
    freshness: freshness(),
  })
}

const entryBlocks = (entry: TaskOwnership.Entry) => {
  const states = [entry.binding.state, entry.execution.state, entry.attention.state]
  if (states.includes("divergent") || states.includes("invalid") || states.includes("blocked")) return true
  return false
}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const binding = yield* TaskBinding.Service
    const authority = yield* TaskAuthority.Service
    const execution = yield* TaskExecution.Service

    const read = Effect.fn("TaskOwnership.read")(function* (input: Input) {
      const bindings = yield* Effect.forEach(input.entries, (entry) =>
        binding.resume(entry.identity).pipe(Effect.exit),
      )
      const queue = yield* authority.observeQueue(
        TaskAuthority.QueueInput.make({
          entries: input.entries.map((entry) => ({ identity: entry.identity })),
          ...(input.snapshotPath === undefined ? {} : { snapshotPath: input.snapshotPath }),
        }),
      )
      const executions = yield* Effect.forEach(input.entries, (entry) => execution.get(entry.identity.mtTaskID))
      const entries = input.entries.map((entry, index) =>
        TaskOwnership.Entry.make({
          identity: entry.identity,
          binding: bindingFact(entry.identity, bindings[index]),
          authority: authorityFact(entry.identity, queue),
          execution: executionFact(entry.identity, executions[index]),
          attention: attentionFact(entry),
        }),
      )
      const extraBlock = entries.some(entryBlocks)
      const result =
        extraBlock && queue.result.kind !== "blocked"
          ? TaskQueue.Blocked.make({ kind: "blocked", reason: "context_divergent" })
          : queue.result
      const state = extraBlock && queue.state === "available" ? "blocked" : queue.state
      return TaskOwnership.Snapshot.make({
        state,
        provenance: provenance("runtime_snapshot", input.snapshotPath ?? "runtime_snapshot"),
        freshness: freshness(queueMeta(queue)),
        result,
        entries,
      })
    })

    return Service.of({ read })
  }),
)

export const node = makeGlobalNode({
  service: Service,
  layer,
  deps: [TaskBinding.node, TaskAuthority.node, TaskExecution.node],
})
