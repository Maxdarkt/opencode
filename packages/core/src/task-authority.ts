export * as TaskAuthority from "./task-authority"

import { Cause, Context, Effect, Exit, Layer, Option, Schema } from "effect"
import { TaskAuthority as Contract } from "@opencode-ai/schema/task-authority"
import { TaskPilot } from "@opencode-ai/schema/task-pilot"
import { TaskQueue } from "@opencode-ai/schema/task-queue"
import { FSUtil } from "./fs-util"
import { makeGlobalNode } from "./effect/app-node"
import { TaskPilot as Pilot } from "./task-pilot"
import { TaskBinding } from "./task-binding"
import { TaskQueue as Queue } from "./task-queue"

export interface Input {
  readonly mtTaskID: string
  readonly worktree: string
  readonly head: string
  readonly snapshotPath?: string
}

export const QueueInput = Contract.QueueInput
export type QueueInput = Contract.QueueInput
export const QueueObservation = Contract.QueueObservation
export type QueueObservation = Contract.QueueObservation

export class Service extends Context.Service<
  Service,
  {
    readonly observe: (input: Input) => Effect.Effect<Contract.Observation>
    readonly observeQueue: (input: QueueInput) => Effect.Effect<QueueObservation>
  }
>()("@opencode/TaskAuthority") {}

const unavailable = (state: Exclude<Contract.State, "available">) =>
  Contract.Observation.make({
    state,
    provenance: "runtime_snapshot",
  })

const queueBlocked = (
  state: Contract.QueueState,
  reason: TaskQueue.BlockReason,
  input: { observedAt?: string; expiresAt?: string; generation?: number; entries?: Contract.QueueEntryObservation[] } = {},
) =>
  Contract.QueueObservation.make({
    state,
    provenance: "runtime_snapshot",
    ...input,
    entries: input.entries ?? [],
    result: TaskQueue.Blocked.make({ kind: "blocked", reason }),
  })

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const fs = yield* FSUtil.Service
    const binding = yield* TaskBinding.Service

    const observe = Effect.fn("TaskAuthority.observe")(function* (input: Input) {
      const filepath = input.snapshotPath ?? process.env.OPENCODE_TASK_AUTHORITY_SNAPSHOT
      if (!filepath) return unavailable("absent")
      const raw = yield* fs.readJson(filepath).pipe(Effect.option)
      if (Option.isNone(raw)) return unavailable("inaccessible")
      const snapshot = yield* Schema.decodeUnknownEffect(Contract.Snapshot)(raw.value).pipe(Effect.option)
      if (Option.isNone(snapshot)) return unavailable("invalid")
      const observed = Date.parse(snapshot.value.observedAt)
      const expires = Date.parse(snapshot.value.expiresAt)
      if (!Number.isFinite(observed) || !Number.isFinite(expires) || observed >= expires) return unavailable("invalid")
      if (Date.now() >= expires) return unavailable("expired")
      const task = snapshot.value.tasks.find((candidate) => candidate.id === input.mtTaskID)
      if (!task) return unavailable("absent")
      if (task.git && (task.git.worktreePath !== input.worktree || task.git.head !== input.head))
        return unavailable("divergent")
      const decoded = yield* Schema.decodeUnknownEffect(TaskPilot.Input)({
        mtStatus: task.mtStatus,
        apexPhase: task.apex.phase,
        context: "concordant",
      }).pipe(Effect.option)
      if (Option.isNone(decoded)) return unavailable("invalid")
      const evaluated = Pilot.evaluate(decoded.value)
      if (evaluated.kind === "blocked" && evaluated.reason === "invalid_status_phase") return unavailable("invalid")
      return Contract.Observation.make({
        state: "available",
        provenance: "runtime_snapshot",
        observedAt: snapshot.value.observedAt,
        expiresAt: snapshot.value.expiresAt,
        generation: snapshot.value.generation,
        mtStatus: decoded.value.mtStatus,
        apexPhase: decoded.value.apexPhase,
      })
    })

    const observeQueue = Effect.fn("TaskAuthority.observeQueue")(function* (input: QueueInput) {
      const filepath = input.snapshotPath ?? process.env.OPENCODE_TASK_AUTHORITY_SNAPSHOT
      if (!filepath) return queueBlocked("absent", "invalid_status_phase")
      const raw = yield* fs.readJson(filepath).pipe(Effect.option)
      if (Option.isNone(raw)) return queueBlocked("inaccessible", "invalid_status_phase")
      const snapshot = yield* Schema.decodeUnknownEffect(Contract.Snapshot)(raw.value).pipe(Effect.option)
      if (Option.isNone(snapshot)) return queueBlocked("invalid", "invalid_status_phase")
      const observed = Date.parse(snapshot.value.observedAt)
      const expires = Date.parse(snapshot.value.expiresAt)
      if (!Number.isFinite(observed) || !Number.isFinite(expires) || observed >= expires)
        return queueBlocked("invalid", "invalid_status_phase")
      if (Date.now() >= expires)
        return queueBlocked("expired", "invalid_status_phase", {
          observedAt: snapshot.value.observedAt,
          expiresAt: snapshot.value.expiresAt,
          generation: snapshot.value.generation,
        })

      const metadata = {
        observedAt: snapshot.value.observedAt,
        expiresAt: snapshot.value.expiresAt,
        generation: snapshot.value.generation,
      }

      const inputIDs = input.entries.map((entry) => entry.identity.mtTaskID)
      if (new Set(inputIDs).size !== inputIDs.length)
        return queueBlocked("invalid", "duplicate_task_id", metadata)
      const snapshotIDs = snapshot.value.tasks.map((task) => task.id)
      if (new Set(snapshotIDs).size !== snapshotIDs.length)
        return queueBlocked("invalid", "duplicate_task_id", metadata)

      const entries: Contract.QueueEntryObservation[] = []
      const queueEntries: TaskQueue.Entry[] = []
      for (const requested of input.entries) {
        const resumed = yield* binding.resume(requested.identity).pipe(Effect.exit)
        if (Exit.isFailure(resumed)) {
          const failure = Option.getOrUndefined(Cause.findErrorOption(resumed.cause))
          const state = failure instanceof TaskBinding.NotFoundError ? "absent" : "divergent"
          return queueBlocked(state, "invalid_status_phase", {
            ...metadata,
            entries,
          })
        }
        const task = snapshot.value.tasks.find((candidate) => candidate.id === requested.identity.mtTaskID)
        if (!task) return queueBlocked("absent", "invalid_status_phase", { ...metadata, entries })
        if (
          !task.git ||
          task.git.worktreePath !== requested.identity.checkout.worktree ||
          task.git.head !== requested.identity.checkout.head
        )
          return queueBlocked("divergent", "invalid_status_phase", { ...metadata, entries })
        const decoded = yield* Schema.decodeUnknownEffect(TaskQueue.Entry)({
          id: task.id,
          mtStatus: task.mtStatus,
          ...(task.mtStatus === "todo" && task.apex.phase === "allocated" ? {} : { apexPhase: task.apex.phase }),
          context: "concordant",
        }).pipe(Effect.exit)
        if (Exit.isFailure(decoded)) return queueBlocked("invalid", "invalid_status_phase", { ...metadata, entries })
        entries.push(
          Contract.QueueEntryObservation.make({
            id: task.id,
            state: "available",
            mtStatus: decoded.value.mtStatus,
            ...(decoded.value.apexPhase ? { apexPhase: decoded.value.apexPhase } : {}),
          }),
        )
        queueEntries.push(decoded.value)
      }

      const result = Queue.evaluate(queueEntries)
      return Contract.QueueObservation.make({
        state: result.kind === "blocked" ? "blocked" : "available",
        provenance: "runtime_snapshot",
        observedAt: snapshot.value.observedAt,
        expiresAt: snapshot.value.expiresAt,
        generation: snapshot.value.generation,
        entries,
        result,
      })
    })

    return Service.of({ observe, observeQueue })
  }),
)

export const node = makeGlobalNode({ service: Service, layer, deps: [FSUtil.node, TaskBinding.node] })
