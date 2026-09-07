import { describe, expect } from "bun:test"
import { Cause, Effect, Exit } from "effect"
import { Database } from "@opencode-ai/core/database/database"
import { AppNodeBuilder } from "@opencode-ai/core/effect/app-node-builder"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { Location } from "@opencode-ai/core/location"
import { ProjectV2 } from "@opencode-ai/core/project"
import { ProjectTable } from "@opencode-ai/core/project/sql"
import { AbsolutePath } from "@opencode-ai/core/schema"
import { SessionSchema } from "@opencode-ai/core/session/schema"
import { SessionTable } from "@opencode-ai/core/session/sql"
import { TaskBinding } from "@opencode-ai/core/task-binding"
import { TaskExecution } from "@opencode-ai/core/task-execution"
import { TaskExecutionEffectTable, TaskExecutionOwnershipTable } from "@opencode-ai/core/task-execution/sql"
import { WorkspaceV2 } from "@opencode-ai/core/workspace"
import { testEffect } from "./lib/effect"

const it = testEffect(AppNodeBuilder.build(LayerNode.group([Database.node, TaskBinding.node, TaskExecution.node])))

const identity = (input?: {
  mtTaskID?: string
  sessionID?: SessionSchema.ID
  worktree?: AbsolutePath
  head?: string
}) =>
  TaskBinding.Identity.make({
    mtTaskID: input?.mtTaskID ?? "DA30-004",
    apexExternalRef: `.project/tasks/${input?.mtTaskID ?? "DA30-004"}`,
    sessionID: input?.sessionID ?? SessionSchema.ID.make("ses_task_execution"),
    projectID: ProjectV2.ID.make("project-task-execution"),
    location: Location.Ref.make({
      directory: input?.worktree ?? AbsolutePath.make("/repo/worktree"),
      workspaceID: WorkspaceV2.ID.make("wrk_task_execution"),
    }),
    checkout: TaskBinding.Checkout.make({
      repository: AbsolutePath.make("/repo"),
      branch: "execution-ownership",
      worktree: input?.worktree ?? AbsolutePath.make("/repo/worktree"),
      head: input?.head ?? "eceeb7dd7734f60491e09cdac72fa297993f4c4b",
    }),
  })

const seedBinding = (expected: TaskBinding.Identity) =>
  Effect.gen(function* () {
    const { db } = yield* Database.Service
    yield* db
      .insert(ProjectTable)
      .values({ id: expected.projectID, worktree: expected.location.directory, sandboxes: [] })
      .onConflictDoNothing()
      .run()
    yield* db
      .insert(SessionTable)
      .values({
        id: expected.sessionID,
        project_id: expected.projectID,
        workspace_id: expected.location.workspaceID,
        slug: expected.mtTaskID.toLowerCase(),
        directory: expected.location.directory,
        title: expected.mtTaskID,
        version: "test",
      })
      .run()
    yield* TaskBinding.Service.use((service) => service.adopt(expected))
  })

const owner = (value: string) => TaskExecution.OwnerID.make(value)
const effect = (value: string) => TaskExecution.EffectID.make(value)

const ownershipRows = Database.Service.use(({ db }) => db.select().from(TaskExecutionOwnershipTable).all())
const effectRows = Database.Service.use(({ db }) => db.select().from(TaskExecutionEffectTable).all())

describe("TaskExecution", () => {
  it.effect("re-exports the canonical Schema contracts and rejects invalid tokens", () =>
    Effect.gen(function* () {
      const schema = yield* Effect.promise(() => import("@opencode-ai/schema/task-execution"))
      expect(TaskExecution.Token).toBe(schema.TaskExecution.Token)
      expect(TaskExecution.Resolution).toBe(schema.TaskExecution.Resolution)
      expect(() => TaskExecution.OwnerID.make("")).toThrow()
      expect(() => TaskExecution.EffectID.make("")).toThrow()
      expect(() =>
        TaskExecution.Token.make({
          mtTaskID: "DA30-004",
          sessionID: SessionSchema.ID.make("ses_task_execution"),
          worktree: AbsolutePath.make("/repo/worktree"),
          ownerID: owner("owner-a"),
          generation: 0,
        }),
      ).toThrow()
    }),
  )

  it.effect("requires the exact durable binding before acquiring ownership", () =>
    Effect.gen(function* () {
      const expected = identity()
      const service = yield* TaskExecution.Service
      expect(yield* service.acquire(expected, owner("owner-a")).pipe(Effect.flip)).toBeInstanceOf(
        TaskBinding.SessionNotFoundError,
      )
      expect(yield* ownershipRows).toEqual([])

      yield* seedBinding(expected)
      const divergent = TaskBinding.Identity.make({
        ...expected,
        checkout: TaskBinding.Checkout.make({ ...expected.checkout, head: "other-head" }),
      })
      expect(yield* service.acquire(divergent, owner("owner-a")).pipe(Effect.flip)).toBeInstanceOf(
        TaskBinding.ConflictError,
      )
      expect(yield* ownershipRows).toEqual([])
    }),
  )

  it.effect("acquires once and replays only the exact active owner", () =>
    Effect.gen(function* () {
      const expected = identity()
      const service = yield* TaskExecution.Service
      yield* seedBinding(expected)

      const token = yield* service.acquire(expected, owner("owner-a"))
      expect(token).toEqual({
        mtTaskID: expected.mtTaskID,
        sessionID: expected.sessionID,
        worktree: expected.checkout.worktree,
        ownerID: "owner-a",
        generation: 1,
      })
      expect(yield* service.acquire(expected, owner("owner-a"))).toEqual(token)
      const conflict = yield* service.acquire(expected, owner("owner-b")).pipe(Effect.flip)
      expect(conflict).toBeInstanceOf(TaskExecution.ConflictError)
      if (conflict instanceof TaskExecution.ConflictError) expect(conflict.fields).toEqual(["ownerID"])
      expect((yield* ownershipRows).map((row) => row.owner_id)).toEqual(["owner-a"])
    }),
  )

  it.effect("allows only one winner when different owners acquire concurrently", () =>
    Effect.gen(function* () {
      const expected = identity()
      const service = yield* TaskExecution.Service
      yield* seedBinding(expected)

      const results = yield* Effect.all(
        [
          service.acquire(expected, owner("owner-a")).pipe(Effect.exit),
          service.acquire(expected, owner("owner-b")).pipe(Effect.exit),
        ],
        { concurrency: "unbounded" },
      )
      expect(results.filter(Exit.isSuccess)).toHaveLength(1)
      expect(results.filter(Exit.isFailure)).toHaveLength(1)
      const rejected = results.find(Exit.isFailure)
      if (rejected && Exit.isFailure(rejected)) {
        expect(Cause.squash(rejected.cause)).toBeInstanceOf(TaskExecution.ConflictError)
      }
      expect(yield* ownershipRows).toHaveLength(1)
    }),
  )

  it.effect("rejects a second task that targets an owned worktree", () =>
    Effect.gen(function* () {
      const first = identity()
      const second = identity({
        mtTaskID: "DA30-099",
        sessionID: SessionSchema.ID.make("ses_task_execution_other"),
      })
      const service = yield* TaskExecution.Service
      yield* seedBinding(first)
      yield* seedBinding(second)
      yield* service.acquire(first, owner("owner-a"))

      const conflict = yield* service.acquire(second, owner("owner-b")).pipe(Effect.flip)
      expect(conflict).toBeInstanceOf(TaskExecution.ConflictError)
      if (conflict instanceof TaskExecution.ConflictError) {
        expect(conflict.fields).toContain("mtTaskID")
        expect(conflict.fields).toContain("sessionID")
        expect(conflict.fields).toContain("ownerID")
      }
      expect(yield* ownershipRows).toHaveLength(1)
    }),
  )

  it.effect("marks effects before execution and confirms them idempotently", () =>
    Effect.gen(function* () {
      const expected = identity()
      const service = yield* TaskExecution.Service
      yield* seedBinding(expected)
      const token = yield* service.acquire(expected, owner("owner-a"))
      const effectID = effect("effect-1")

      expect(yield* service.begin(token, effectID)).toBe("execute")
      expect(yield* service.begin(token, effectID).pipe(Effect.flip)).toEqual(
        new TaskExecution.UncertainEffectsError({ effectIDs: [effectID] }),
      )
      expect(yield* service.confirm(token, effectID)).toEqual({ effectID, state: "confirmed" })
      expect(yield* service.confirm(token, effectID)).toEqual({ effectID, state: "confirmed" })
      expect(yield* service.begin(token, effectID)).toBe("confirmed")
      expect(yield* service.get(expected.mtTaskID)).toMatchObject({
        ...token,
        effects: [{ effectID, state: "confirmed" }],
      })
    }),
  )

  it.effect("keeps an interrupted effect uncertain until every pending effect is resolved", () =>
    Effect.gen(function* () {
      const expected = identity()
      const service = yield* TaskExecution.Service
      yield* seedBinding(expected)
      const token = yield* service.acquire(expected, owner("owner-a"))
      const effectID = effect("effect-1")
      yield* service.begin(token, effectID)

      const missing = yield* service
        .resume({ identity: expected, previous: token, ownerID: owner("owner-b"), resolutions: [] })
        .pipe(Effect.flip)
      expect(missing).toEqual(new TaskExecution.UncertainEffectsError({ effectIDs: [effectID] }))
      const uncertain = yield* service
        .resume({
          identity: expected,
          previous: token,
          ownerID: owner("owner-b"),
          resolutions: [{ effectID, state: "uncertain" }],
        })
        .pipe(Effect.flip)
      expect(uncertain).toEqual(new TaskExecution.UncertainEffectsError({ effectIDs: [effectID] }))
      expect(yield* service.get(expected.mtTaskID)).toMatchObject({
        ...token,
        effects: [{ effectID, state: "pending" }],
      })
    }),
  )

  it.effect("preserves confirmed observations and fences the interrupted owner", () =>
    Effect.gen(function* () {
      const expected = identity()
      const service = yield* TaskExecution.Service
      yield* seedBinding(expected)
      const previous = yield* service.acquire(expected, owner("owner-a"))
      const effectID = effect("effect-1")
      yield* service.begin(previous, effectID)

      const resumed = yield* service.resume({
        identity: expected,
        previous,
        ownerID: owner("owner-b"),
        resolutions: [{ effectID, state: "confirmed" }],
      })
      expect(resumed).toEqual({ ...previous, ownerID: "owner-b", generation: 2 })
      expect(yield* service.begin(resumed, effectID)).toBe("confirmed")
      expect(yield* service.begin(previous, effect("effect-2")).pipe(Effect.flip)).toBeInstanceOf(
        TaskExecution.ConflictError,
      )
      expect(yield* service.get(expected.mtTaskID)).toMatchObject({
        ...resumed,
        effects: [{ effectID, state: "confirmed" }],
      })
    }),
  )

  it.effect("refuses a resume identity that does not match the interrupted token", () =>
    Effect.gen(function* () {
      const first = identity()
      const second = identity({
        mtTaskID: "DA30-099",
        sessionID: SessionSchema.ID.make("ses_task_execution_other"),
        worktree: AbsolutePath.make("/repo/other-worktree"),
      })
      const service = yield* TaskExecution.Service
      yield* seedBinding(first)
      yield* seedBinding(second)
      const previous = yield* service.acquire(first, owner("owner-a"))

      const conflict = yield* service
        .resume({ identity: second, previous, ownerID: owner("owner-b"), resolutions: [] })
        .pipe(Effect.flip)
      expect(conflict).toBeInstanceOf(TaskExecution.ConflictError)
      if (conflict instanceof TaskExecution.ConflictError) {
        expect(conflict.fields).toEqual(["mtTaskID", "sessionID", "worktree"])
      }
      expect(yield* service.get(first.mtTaskID)).toMatchObject(previous)
      expect(yield* service.get(second.mtTaskID)).toBeUndefined()
    }),
  )

  it.effect("replays only effects observed absent during resume", () =>
    Effect.gen(function* () {
      const expected = identity()
      const service = yield* TaskExecution.Service
      yield* seedBinding(expected)
      const previous = yield* service.acquire(expected, owner("owner-a"))
      const effectID = effect("effect-1")
      yield* service.begin(previous, effectID)

      const resumed = yield* service.resume({
        identity: expected,
        previous,
        ownerID: owner("owner-b"),
        resolutions: [{ effectID, state: "absent" }],
      })
      expect(yield* effectRows).toEqual([])
      expect(yield* service.begin(resumed, effectID)).toBe("execute")
    }),
  )

  it.effect("reconciles confirmed and absent effects atomically before transferring ownership", () =>
    Effect.gen(function* () {
      const expected = identity()
      const service = yield* TaskExecution.Service
      yield* seedBinding(expected)
      const previous = yield* service.acquire(expected, owner("owner-a"))
      const confirmed = effect("effect-confirmed")
      const absent = effect("effect-absent")
      yield* service.begin(previous, confirmed)
      yield* service.begin(previous, absent)

      const resumed = yield* service.resume({
        identity: expected,
        previous,
        ownerID: owner("owner-b"),
        resolutions: [
          { effectID: confirmed, state: "confirmed" },
          { effectID: absent, state: "absent" },
        ],
      })
      expect(resumed.generation).toBe(2)
      expect(yield* service.get(expected.mtTaskID)).toMatchObject({
        ...resumed,
        effects: [{ effectID: confirmed, state: "confirmed" }],
      })
      expect(yield* service.begin(resumed, confirmed)).toBe("confirmed")
      expect(yield* service.begin(resumed, absent)).toBe("execute")
    }),
  )

  it.effect("rejects a divergent binding before changing interrupted ownership or effects", () =>
    Effect.gen(function* () {
      const expected = identity()
      const service = yield* TaskExecution.Service
      yield* seedBinding(expected)
      const previous = yield* service.acquire(expected, owner("owner-a"))
      const effectID = effect("effect-1")
      yield* service.begin(previous, effectID)
      const divergent = TaskBinding.Identity.make({
        ...expected,
        checkout: TaskBinding.Checkout.make({ ...expected.checkout, head: "different-head" }),
      })

      const conflict = yield* service
        .resume({
          identity: divergent,
          previous,
          ownerID: owner("owner-b"),
          resolutions: [{ effectID, state: "absent" }],
        })
        .pipe(Effect.flip)
      expect(conflict).toBeInstanceOf(TaskBinding.ConflictError)
      expect(yield* service.get(expected.mtTaskID)).toMatchObject({
        ...previous,
        effects: [{ effectID, state: "pending" }],
      })
    }),
  )

  it.effect("rejects duplicate or unrelated reconciliation evidence without partial changes", () =>
    Effect.gen(function* () {
      const expected = identity()
      const service = yield* TaskExecution.Service
      yield* seedBinding(expected)
      const previous = yield* service.acquire(expected, owner("owner-a"))
      const effectID = effect("effect-1")
      yield* service.begin(previous, effectID)

      const invalid = yield* service
        .resume({
          identity: expected,
          previous,
          ownerID: owner("owner-b"),
          resolutions: [
            { effectID, state: "absent" },
            { effectID, state: "confirmed" },
            { effectID: effect("unknown-effect"), state: "absent" },
          ],
        })
        .pipe(Effect.flip)
      expect(invalid).toBeInstanceOf(TaskExecution.InvalidReconciliationError)
      if (invalid instanceof TaskExecution.InvalidReconciliationError) {
        expect(invalid.effectIDs).toEqual([effectID, "unknown-effect"])
      }
      expect(yield* service.get(expected.mtTaskID)).toMatchObject({
        ...previous,
        effects: [{ effectID, state: "pending" }],
      })
    }),
  )

  it.effect("does not confirm an effect that was never admitted", () =>
    Effect.gen(function* () {
      const expected = identity()
      const service = yield* TaskExecution.Service
      yield* seedBinding(expected)
      const token = yield* service.acquire(expected, owner("owner-a"))
      const effectID = effect("missing-effect")

      expect(yield* service.confirm(token, effectID).pipe(Effect.flip)).toEqual(
        new TaskExecution.EffectNotFoundError({ effectID }),
      )
      expect(yield* effectRows).toEqual([])
    }),
  )
})
