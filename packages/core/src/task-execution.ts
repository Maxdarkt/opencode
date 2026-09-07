export * as TaskExecution from "./task-execution"

import { Context, Effect, Layer, Schema } from "effect"
import { TaskExecution } from "@opencode-ai/schema/task-execution"
import { and, asc, eq, or } from "drizzle-orm"
import { Database } from "./database/database"
import { makeGlobalNode } from "./effect/app-node"
import { AbsolutePath } from "./schema"
import { SessionSchema } from "./session/schema"
import { TaskBinding } from "./task-binding"
import { TaskExecutionEffectTable, TaskExecutionOwnershipTable } from "./task-execution/sql"

export const OwnerID = TaskExecution.OwnerID
export type OwnerID = TaskExecution.OwnerID

export const EffectID = TaskExecution.EffectID
export type EffectID = TaskExecution.EffectID

export const Generation = TaskExecution.Generation
export type Generation = TaskExecution.Generation

export const Field = TaskExecution.Field
export type Field = TaskExecution.Field

export const Token = TaskExecution.Token
export type Token = TaskExecution.Token

export const EffectState = TaskExecution.EffectState
export type EffectState = TaskExecution.EffectState

export const EffectInfo = TaskExecution.EffectInfo
export type EffectInfo = TaskExecution.EffectInfo

export const Snapshot = TaskExecution.Snapshot
export type Snapshot = TaskExecution.Snapshot

export const BeginDecision = TaskExecution.BeginDecision
export type BeginDecision = TaskExecution.BeginDecision

export const ResolutionState = TaskExecution.ResolutionState
export type ResolutionState = TaskExecution.ResolutionState

export const Resolution = TaskExecution.Resolution
export type Resolution = TaskExecution.Resolution

export class NotFoundError extends Schema.TaggedErrorClass<NotFoundError>()("TaskExecution.NotFoundError", {
  mtTaskID: Schema.String,
}) {}

export class ConflictError extends Schema.TaggedErrorClass<ConflictError>()("TaskExecution.ConflictError", {
  fields: Schema.Array(Field),
  expected: Token,
  observed: Schema.Array(Token),
}) {}

export class EffectNotFoundError extends Schema.TaggedErrorClass<EffectNotFoundError>()(
  "TaskExecution.EffectNotFoundError",
  { effectID: EffectID },
) {}

export class UncertainEffectsError extends Schema.TaggedErrorClass<UncertainEffectsError>()(
  "TaskExecution.UncertainEffectsError",
  { effectIDs: Schema.Array(EffectID) },
) {}

export class InvalidReconciliationError extends Schema.TaggedErrorClass<InvalidReconciliationError>()(
  "TaskExecution.InvalidReconciliationError",
  { effectIDs: Schema.Array(EffectID) },
) {}

export type Error =
  | TaskBinding.Error
  | NotFoundError
  | ConflictError
  | EffectNotFoundError
  | UncertainEffectsError
  | InvalidReconciliationError

export interface Interface {
  readonly get: (mtTaskID: string) => Effect.Effect<Snapshot | undefined>
  readonly acquire: (
    identity: TaskBinding.Identity,
    ownerID: OwnerID,
  ) => Effect.Effect<Token, TaskBinding.Error | ConflictError>
  readonly begin: (
    token: Token,
    effectID: EffectID,
  ) => Effect.Effect<BeginDecision, NotFoundError | ConflictError | UncertainEffectsError>
  readonly confirm: (
    token: Token,
    effectID: EffectID,
  ) => Effect.Effect<EffectInfo, NotFoundError | ConflictError | EffectNotFoundError>
  readonly resume: (input: {
    readonly identity: TaskBinding.Identity
    readonly previous: Token
    readonly ownerID: OwnerID
    readonly resolutions: ReadonlyArray<Resolution>
  }) => Effect.Effect<
    Token,
    TaskBinding.Error | NotFoundError | ConflictError | UncertainEffectsError | InvalidReconciliationError
  >
}

export class Service extends Context.Service<Service, Interface>()("@opencode/TaskExecution") {}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const { db } = yield* Database.Service
    const binding = yield* TaskBinding.Service

    const fromRow = (row: typeof TaskExecutionOwnershipTable.$inferSelect): Token =>
      TaskExecution.Token.make({
        mtTaskID: row.mt_task_id,
        sessionID: SessionSchema.ID.make(row.session_id),
        worktree: AbsolutePath.make(row.worktree),
        ownerID: row.owner_id,
        generation: row.generation,
      })

    const fromEffectRow = (row: typeof TaskExecutionEffectTable.$inferSelect): EffectInfo =>
      TaskExecution.EffectInfo.make({ effectID: row.effect_id, state: row.state })

    const fields = (expected: Token, observed: Token) =>
      [
        expected.mtTaskID === observed.mtTaskID ? undefined : ("mtTaskID" as const),
        expected.sessionID === observed.sessionID ? undefined : ("sessionID" as const),
        expected.worktree === observed.worktree ? undefined : ("worktree" as const),
        expected.ownerID === observed.ownerID ? undefined : ("ownerID" as const),
        expected.generation === observed.generation ? undefined : ("generation" as const),
      ].filter((field): field is Field => field !== undefined)

    const conflict = (expected: Token, observed: Token[]) =>
      new ConflictError({
        fields: Array.from(new Set(observed.flatMap((token) => fields(expected, token)))),
        expected,
        observed,
      })

    const expectedToken = (identity: TaskBinding.Identity, ownerID: OwnerID, generation: Generation) =>
      TaskExecution.Token.make({
        mtTaskID: identity.mtTaskID,
        sessionID: identity.sessionID,
        worktree: identity.checkout.worktree,
        ownerID,
        generation,
      })

    const get = Effect.fn("TaskExecution.get")(function* (mtTaskID: string) {
      const owner = yield* db
        .select()
        .from(TaskExecutionOwnershipTable)
        .where(eq(TaskExecutionOwnershipTable.mt_task_id, mtTaskID))
        .get()
        .pipe(Effect.orDie)
      if (!owner) return undefined
      const effects = yield* db
        .select()
        .from(TaskExecutionEffectTable)
        .where(eq(TaskExecutionEffectTable.mt_task_id, mtTaskID))
        .orderBy(asc(TaskExecutionEffectTable.effect_id))
        .all()
        .pipe(Effect.orDie)
      return TaskExecution.Snapshot.make({ ...fromRow(owner), effects: effects.map(fromEffectRow) })
    })

    const acquire = Effect.fn("TaskExecution.acquire")(function* (identity: TaskBinding.Identity, ownerID: OwnerID) {
      yield* binding.resume(identity)
      return yield* db
        .transaction(
          (tx) =>
            Effect.gen(function* () {
              const rows = yield* tx
                .select()
                .from(TaskExecutionOwnershipTable)
                .where(
                  or(
                    eq(TaskExecutionOwnershipTable.mt_task_id, identity.mtTaskID),
                    eq(TaskExecutionOwnershipTable.session_id, identity.sessionID),
                    eq(TaskExecutionOwnershipTable.worktree, identity.checkout.worktree),
                  ),
                )
                .all()
                .pipe(Effect.orDie)
              if (rows.length) {
                const observed = rows.map(fromRow)
                const expected = expectedToken(identity, ownerID, observed[0].generation)
                if (observed.length === 1 && fields(expected, observed[0]).length === 0) return observed[0]
                return yield* conflict(expected, observed)
              }
              const now = Date.now()
              const token = expectedToken(identity, ownerID, 1)
              yield* tx
                .insert(TaskExecutionOwnershipTable)
                .values({
                  mt_task_id: token.mtTaskID,
                  session_id: token.sessionID,
                  worktree: token.worktree,
                  owner_id: token.ownerID,
                  generation: token.generation,
                  time_created: now,
                  time_updated: now,
                })
                .run()
                .pipe(Effect.orDie)
              return token
            }),
          { behavior: "immediate" },
        )
        .pipe(Effect.catchTag("SqlError", Effect.die))
    })

    const begin = Effect.fn("TaskExecution.begin")(function* (token: Token, effectID: EffectID) {
      return yield* db
        .transaction(
          (tx) =>
            Effect.gen(function* () {
              const row = yield* tx
                .select()
                .from(TaskExecutionOwnershipTable)
                .where(eq(TaskExecutionOwnershipTable.mt_task_id, token.mtTaskID))
                .get()
                .pipe(Effect.orDie)
              if (!row) return yield* new NotFoundError({ mtTaskID: token.mtTaskID })
              const observed = fromRow(row)
              if (fields(token, observed).length) return yield* conflict(token, [observed])
              const effect = yield* tx
                .select()
                .from(TaskExecutionEffectTable)
                .where(
                  and(
                    eq(TaskExecutionEffectTable.mt_task_id, token.mtTaskID),
                    eq(TaskExecutionEffectTable.effect_id, effectID),
                  ),
                )
                .get()
                .pipe(Effect.orDie)
              if (effect?.state === "confirmed") return "confirmed" as const
              if (effect) return yield* new UncertainEffectsError({ effectIDs: [effect.effect_id] })
              const now = Date.now()
              yield* tx
                .insert(TaskExecutionEffectTable)
                .values({
                  mt_task_id: token.mtTaskID,
                  effect_id: effectID,
                  state: "pending",
                  time_created: now,
                  time_updated: now,
                })
                .run()
                .pipe(Effect.orDie)
              return "execute" as const
            }),
          { behavior: "immediate" },
        )
        .pipe(Effect.catchTag("SqlError", Effect.die))
    })

    const confirm = Effect.fn("TaskExecution.confirm")(function* (token: Token, effectID: EffectID) {
      return yield* db
        .transaction(
          (tx) =>
            Effect.gen(function* () {
              const row = yield* tx
                .select()
                .from(TaskExecutionOwnershipTable)
                .where(eq(TaskExecutionOwnershipTable.mt_task_id, token.mtTaskID))
                .get()
                .pipe(Effect.orDie)
              if (!row) return yield* new NotFoundError({ mtTaskID: token.mtTaskID })
              const observed = fromRow(row)
              if (fields(token, observed).length) return yield* conflict(token, [observed])
              const effect = yield* tx
                .select()
                .from(TaskExecutionEffectTable)
                .where(
                  and(
                    eq(TaskExecutionEffectTable.mt_task_id, token.mtTaskID),
                    eq(TaskExecutionEffectTable.effect_id, effectID),
                  ),
                )
                .get()
                .pipe(Effect.orDie)
              if (!effect) return yield* new EffectNotFoundError({ effectID })
              if (effect.state === "confirmed") return fromEffectRow(effect)
              yield* tx
                .update(TaskExecutionEffectTable)
                .set({ state: "confirmed", time_updated: Date.now() })
                .where(
                  and(
                    eq(TaskExecutionEffectTable.mt_task_id, token.mtTaskID),
                    eq(TaskExecutionEffectTable.effect_id, effectID),
                  ),
                )
                .run()
                .pipe(Effect.orDie)
              return TaskExecution.EffectInfo.make({ effectID, state: "confirmed" })
            }),
          { behavior: "immediate" },
        )
        .pipe(Effect.catchTag("SqlError", Effect.die))
    })

    const resume = Effect.fn("TaskExecution.resume")(function* (input: {
      readonly identity: TaskBinding.Identity
      readonly previous: Token
      readonly ownerID: OwnerID
      readonly resolutions: ReadonlyArray<Resolution>
    }) {
      yield* binding.resume(input.identity)
      const expectedPrevious = expectedToken(input.identity, input.previous.ownerID, input.previous.generation)
      if (fields(expectedPrevious, input.previous).length) return yield* conflict(expectedPrevious, [input.previous])
      return yield* db
        .transaction(
          (tx) =>
            Effect.gen(function* () {
              const row = yield* tx
                .select()
                .from(TaskExecutionOwnershipTable)
                .where(eq(TaskExecutionOwnershipTable.mt_task_id, input.previous.mtTaskID))
                .get()
                .pipe(Effect.orDie)
              if (!row) return yield* new NotFoundError({ mtTaskID: input.previous.mtTaskID })
              const observed = fromRow(row)
              if (fields(input.previous, observed).length) return yield* conflict(input.previous, [observed])
              const pending = yield* tx
                .select()
                .from(TaskExecutionEffectTable)
                .where(
                  and(
                    eq(TaskExecutionEffectTable.mt_task_id, input.previous.mtTaskID),
                    eq(TaskExecutionEffectTable.state, "pending"),
                  ),
                )
                .orderBy(asc(TaskExecutionEffectTable.effect_id))
                .all()
                .pipe(Effect.orDie)
              const duplicate = input.resolutions
                .filter(
                  (resolution, index) =>
                    input.resolutions.findIndex((candidate) => candidate.effectID === resolution.effectID) !== index,
                )
                .map((resolution) => resolution.effectID)
              const pendingIDs = new Set(pending.map((effect) => effect.effect_id))
              const unknown = input.resolutions
                .filter((resolution) => !pendingIDs.has(resolution.effectID))
                .map((resolution) => resolution.effectID)
              const invalid = Array.from(new Set([...duplicate, ...unknown]))
              if (invalid.length) return yield* new InvalidReconciliationError({ effectIDs: invalid })
              const resolutions = new Map(
                input.resolutions.map((resolution) => [resolution.effectID, resolution.state]),
              )
              const uncertain = pending
                .filter((effect) => {
                  const state = resolutions.get(effect.effect_id)
                  return state === undefined || state === "uncertain"
                })
                .map((effect) => effect.effect_id)
              if (uncertain.length) return yield* new UncertainEffectsError({ effectIDs: uncertain })

              yield* Effect.forEach(
                pending,
                (effect) => {
                  const where = and(
                    eq(TaskExecutionEffectTable.mt_task_id, input.previous.mtTaskID),
                    eq(TaskExecutionEffectTable.effect_id, effect.effect_id),
                  )
                  return resolutions.get(effect.effect_id) === "confirmed"
                    ? tx
                        .update(TaskExecutionEffectTable)
                        .set({ state: "confirmed", time_updated: Date.now() })
                        .where(where)
                        .run()
                        .pipe(Effect.orDie)
                    : tx.delete(TaskExecutionEffectTable).where(where).run().pipe(Effect.orDie)
                },
                { discard: true },
              )
              const token = expectedToken(input.identity, input.ownerID, input.previous.generation + 1)
              yield* tx
                .update(TaskExecutionOwnershipTable)
                .set({ owner_id: token.ownerID, generation: token.generation, time_updated: Date.now() })
                .where(eq(TaskExecutionOwnershipTable.mt_task_id, token.mtTaskID))
                .run()
                .pipe(Effect.orDie)
              return token
            }),
          { behavior: "immediate" },
        )
        .pipe(Effect.catchTag("SqlError", Effect.die))
    })

    return Service.of({ get, acquire, begin, confirm, resume })
  }),
)

export const node = makeGlobalNode({ service: Service, layer, deps: [Database.node, TaskBinding.node] })
