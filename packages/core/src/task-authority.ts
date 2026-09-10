export * as TaskAuthority from "./task-authority"

import { Context, Effect, Layer, Option, Schema } from "effect"
import { TaskAuthority as Contract } from "@opencode-ai/schema/task-authority"
import { TaskPilot } from "@opencode-ai/schema/task-pilot"
import { FSUtil } from "./fs-util"
import { makeGlobalNode } from "./effect/app-node"
import { TaskPilot as Pilot } from "./task-pilot"

export interface Input {
  readonly mtTaskID: string
  readonly worktree: string
  readonly head: string
  readonly snapshotPath?: string
}

export class Service extends Context.Service<
  Service,
  { readonly observe: (input: Input) => Effect.Effect<Contract.Observation> }
>()("@opencode/TaskAuthority") {}

const unavailable = (state: Exclude<Contract.State, "available">) =>
  Contract.Observation.make({
    state,
    provenance: "runtime_snapshot",
  })

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const fs = yield* FSUtil.Service

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

    return Service.of({ observe })
  }),
)

export const node = makeGlobalNode({ service: Service, layer, deps: [FSUtil.node] })
