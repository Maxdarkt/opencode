export * as TaskBinding from "./task-binding"

import { DateTime, Schema } from "effect"
import { Context, Effect, Layer } from "effect"
import { or, eq } from "drizzle-orm"
import { TaskBinding } from "@opencode-ai/schema/task-binding"
import { Database } from "./database/database"
import { makeGlobalNode } from "./effect/app-node"
import { Location } from "./location"
import { ProjectV2 } from "./project"
import { AbsolutePath } from "./schema"
import { SessionSchema } from "./session/schema"
import { SessionTable } from "./session/sql"
import { TaskBindingTable } from "./task-binding/sql"
import { WorkspaceV2 } from "./workspace"

export const Version = TaskBinding.Version
export type Version = TaskBinding.Version

export const Field = TaskBinding.Field
export type Field = TaskBinding.Field

export const Checkout = TaskBinding.Checkout
export type Checkout = TaskBinding.Checkout

export const Identity = TaskBinding.Identity
export type Identity = TaskBinding.Identity

export const Info = TaskBinding.Info
export type Info = TaskBinding.Info

export const Ref = TaskBinding.Ref
export type Ref = TaskBinding.Ref

export class NotFoundError extends Schema.TaggedErrorClass<NotFoundError>()("TaskBinding.NotFoundError", {
  ref: Ref,
}) {}

export class SessionNotFoundError extends Schema.TaggedErrorClass<SessionNotFoundError>()(
  "TaskBinding.SessionNotFoundError",
  { sessionID: SessionSchema.ID },
) {}

export class ConflictError extends Schema.TaggedErrorClass<ConflictError>()("TaskBinding.ConflictError", {
  fields: Schema.Array(Field),
  expected: Identity,
  observed: Schema.Array(Identity),
}) {}

export type Error = NotFoundError | SessionNotFoundError | ConflictError

export interface Interface {
  readonly get: (ref: Ref) => Effect.Effect<Info | undefined>
  readonly adopt: (identity: Identity) => Effect.Effect<Info, SessionNotFoundError | ConflictError>
  readonly resume: (identity: Identity) => Effect.Effect<Info, Error>
}

export class Service extends Context.Service<Service, Interface>()("@opencode/TaskBinding") {}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const { db } = yield* Database.Service

    const fromRow = (row: typeof TaskBindingTable.$inferSelect): Info =>
      TaskBinding.Info.make({
        mtTaskID: row.mt_task_id,
        apexExternalRef: row.apex_external_ref,
        sessionID: SessionSchema.ID.make(row.session_id),
        projectID: ProjectV2.ID.make(row.project_id),
        location: Location.Ref.make({
          directory: AbsolutePath.make(row.location_directory),
          workspaceID: row.location_workspace_id ? WorkspaceV2.ID.make(row.location_workspace_id) : undefined,
        }),
        checkout: TaskBinding.Checkout.make({
          repository: AbsolutePath.make(row.repository),
          branch: row.branch,
          worktree: AbsolutePath.make(row.worktree),
          head: row.head,
        }),
        version: row.version,
        time: {
          created: DateTime.makeUnsafe(row.time_created),
          updated: DateTime.makeUnsafe(row.time_updated),
        },
      })

    const toIdentity = (info: Info): Identity =>
      TaskBinding.Identity.make({
        mtTaskID: info.mtTaskID,
        apexExternalRef: info.apexExternalRef,
        sessionID: info.sessionID,
        projectID: info.projectID,
        location: info.location,
        checkout: info.checkout,
      })

    const fields = (expected: Identity, observed: Identity) =>
      [
        expected.mtTaskID === observed.mtTaskID ? undefined : ("mtTaskID" as const),
        expected.apexExternalRef === observed.apexExternalRef ? undefined : ("apexExternalRef" as const),
        expected.sessionID === observed.sessionID ? undefined : ("sessionID" as const),
        expected.projectID === observed.projectID ? undefined : ("projectID" as const),
        expected.location.directory === observed.location.directory ? undefined : ("location.directory" as const),
        expected.location.workspaceID === observed.location.workspaceID ? undefined : ("location.workspaceID" as const),
        expected.checkout.repository === observed.checkout.repository ? undefined : ("repository" as const),
        expected.checkout.branch === observed.checkout.branch ? undefined : ("branch" as const),
        expected.checkout.worktree === observed.checkout.worktree ? undefined : ("worktree" as const),
        expected.checkout.head === observed.checkout.head ? undefined : ("head" as const),
      ].filter((field): field is Field => field !== undefined)

    const candidates = (identity: Identity) =>
      db
        .select()
        .from(TaskBindingTable)
        .where(
          or(
            eq(TaskBindingTable.mt_task_id, identity.mtTaskID),
            eq(TaskBindingTable.apex_external_ref, identity.apexExternalRef),
            eq(TaskBindingTable.session_id, identity.sessionID),
          ),
        )
        .all()
        .pipe(
          Effect.orDie,
          Effect.map((rows) => rows.map(fromRow)),
        )

    const validateSession = Effect.fn("TaskBinding.validateSession")(function* (
      identity: Identity,
      session: typeof SessionTable.$inferSelect | undefined,
    ) {
      if (!session) return yield* new SessionNotFoundError({ sessionID: identity.sessionID })
      const observed = TaskBinding.Identity.make({
        ...identity,
        projectID: ProjectV2.ID.make(session.project_id),
        location: Location.Ref.make({
          directory: AbsolutePath.make(session.directory),
          workspaceID: session.workspace_id ? WorkspaceV2.ID.make(session.workspace_id) : undefined,
        }),
      })
      const mismatch = fields(identity, observed)
      if (mismatch.length)
        return yield* new ConflictError({ fields: mismatch, expected: identity, observed: [observed] })
      return yield* Effect.void
    })

    const reconcile = (identity: Identity, observed: Info[]) => {
      if (observed.length === 1 && fields(identity, toIdentity(observed[0])).length === 0) return observed[0]
      const mismatch = Array.from(new Set(observed.flatMap((binding) => fields(identity, toIdentity(binding)))))
      return new ConflictError({
        fields: mismatch,
        expected: identity,
        observed: observed.map(toIdentity),
      })
    }

    const get = Effect.fn("TaskBinding.get")(function* (ref: Ref) {
      const where =
        ref.type === "mt_task"
          ? eq(TaskBindingTable.mt_task_id, ref.value)
          : ref.type === "apex_external_ref"
            ? eq(TaskBindingTable.apex_external_ref, ref.value)
            : eq(TaskBindingTable.session_id, ref.value)
      const row = yield* db.select().from(TaskBindingTable).where(where).get().pipe(Effect.orDie)
      return row ? fromRow(row) : undefined
    })

    const adopt = Effect.fn("TaskBinding.adopt")(function* (identity: Identity) {
      return yield* db
        .transaction((tx) =>
          Effect.gen(function* () {
            const session = yield* tx
              .select()
              .from(SessionTable)
              .where(eq(SessionTable.id, identity.sessionID))
              .get()
              .pipe(Effect.orDie)
            yield* validateSession(identity, session)
            const rows = yield* tx
              .select()
              .from(TaskBindingTable)
              .where(
                or(
                  eq(TaskBindingTable.mt_task_id, identity.mtTaskID),
                  eq(TaskBindingTable.apex_external_ref, identity.apexExternalRef),
                  eq(TaskBindingTable.session_id, identity.sessionID),
                ),
              )
              .all()
              .pipe(Effect.orDie)
            if (rows.length) {
              const result = reconcile(identity, rows.map(fromRow))
              if (result instanceof ConflictError) return yield* result
              return result
            }
            const now = Date.now()
            yield* tx
              .insert(TaskBindingTable)
              .values({
                mt_task_id: identity.mtTaskID,
                apex_external_ref: identity.apexExternalRef,
                session_id: identity.sessionID,
                project_id: identity.projectID,
                location_directory: identity.location.directory,
                location_workspace_id: identity.location.workspaceID,
                repository: identity.checkout.repository,
                branch: identity.checkout.branch,
                worktree: identity.checkout.worktree,
                head: identity.checkout.head,
                version: 1,
                time_created: now,
                time_updated: now,
              })
              .run()
              .pipe(Effect.orDie)
            return fromRow({
              mt_task_id: identity.mtTaskID,
              apex_external_ref: identity.apexExternalRef,
              session_id: identity.sessionID,
              project_id: identity.projectID,
              location_directory: identity.location.directory,
              location_workspace_id: identity.location.workspaceID ?? null,
              repository: identity.checkout.repository,
              branch: identity.checkout.branch,
              worktree: identity.checkout.worktree,
              head: identity.checkout.head,
              version: 1,
              time_created: now,
              time_updated: now,
            })
          }),
        )
        .pipe(Effect.catchTag("SqlError", Effect.die))
    })

    const resume = Effect.fn("TaskBinding.resume")(function* (identity: Identity) {
      const session = yield* db
        .select()
        .from(SessionTable)
        .where(eq(SessionTable.id, identity.sessionID))
        .get()
        .pipe(Effect.orDie)
      yield* validateSession(identity, session)
      const observed = yield* candidates(identity)
      if (!observed.length) return yield* new NotFoundError({ ref: { type: "mt_task", value: identity.mtTaskID } })
      const result = reconcile(identity, observed)
      if (result instanceof ConflictError) return yield* result
      return result
    })

    return Service.of({ get, adopt, resume })
  }),
)

export const node = makeGlobalNode({ service: Service, layer, deps: [Database.node] })
