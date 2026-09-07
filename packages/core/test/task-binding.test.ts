import { describe, expect } from "bun:test"
import { DateTime, Effect } from "effect"
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
import { TaskBindingTable } from "@opencode-ai/core/task-binding/sql"
import { WorkspaceV2 } from "@opencode-ai/core/workspace"
import { testEffect } from "./lib/effect"

const it = testEffect(AppNodeBuilder.build(LayerNode.group([Database.node, TaskBinding.node])))

const identity = () =>
  TaskBinding.Identity.make({
    mtTaskID: "DA20-003",
    apexExternalRef: ".project/tasks/DA20-003-binding-tache-session-worktree",
    sessionID: SessionSchema.ID.make("ses_task_binding"),
    projectID: ProjectV2.ID.make("project-task-binding"),
    location: Location.Ref.make({
      directory: AbsolutePath.make("/repo/worktree"),
      workspaceID: WorkspaceV2.ID.make("wrk_task_binding"),
    }),
    checkout: TaskBinding.Checkout.make({
      repository: AbsolutePath.make("/repo"),
      branch: "task-session-binding",
      worktree: AbsolutePath.make("/repo/worktree"),
      head: "9ba850b68b49bd20e2e40d24ceba39dd5fb19af2",
    }),
  })

const seedSession = (
  binding: TaskBinding.Identity,
  input?: {
    projectID?: ProjectV2.ID
    directory?: AbsolutePath
    workspaceID?: WorkspaceV2.ID
  },
) =>
  Database.Service.use(({ db }) => {
    const projectID = input?.projectID ?? binding.projectID
    const directory = input?.directory ?? binding.location.directory
    return Effect.gen(function* () {
      yield* db
        .insert(ProjectTable)
        .values({ id: projectID, worktree: directory, sandboxes: [] })
        .onConflictDoNothing()
        .run()
      yield* db
        .insert(SessionTable)
        .values({
          id: binding.sessionID,
          project_id: projectID,
          workspace_id: input?.workspaceID ?? binding.location.workspaceID,
          slug: "task-binding",
          directory,
          title: "Task binding",
          version: "test",
        })
        .run()
    })
  })

const stored = Database.Service.use(({ db }) => db.select().from(TaskBindingTable).all())

describe("TaskBinding", () => {
  it.effect("rejects empty task and checkout identifiers at the contract boundary", () =>
    Effect.sync(() => {
      const expected = identity()
      expect(() => TaskBinding.Identity.make({ ...expected, mtTaskID: "" })).toThrow()
      expect(() =>
        TaskBinding.Identity.make({
          ...expected,
          checkout: TaskBinding.Checkout.make({ ...expected.checkout, branch: "" }),
        }),
      ).toThrow()
      expect(() =>
        TaskBinding.Identity.make({
          ...expected,
          checkout: TaskBinding.Checkout.make({ ...expected.checkout, head: "" }),
        }),
      ).toThrow()
    }),
  )

  it.effect("persists one binding and replays an exact adoption without mutation", () =>
    Effect.gen(function* () {
      const expected = identity()
      const service = yield* TaskBinding.Service
      const { db } = yield* Database.Service
      yield* seedSession(expected)

      const created = yield* service.adopt(expected)
      expect(created).toMatchObject({ ...expected, version: 1 })
      yield* db.update(TaskBindingTable).set({ time_updated: 1 }).run()

      const adopted = yield* service.adopt(expected)
      const resumed = yield* service.resume(expected)
      expect(DateTime.toEpochMillis(adopted.time.updated)).toBe(1)
      expect(resumed).toEqual(adopted)
      expect(yield* service.get({ type: "mt_task", value: expected.mtTaskID })).toEqual(adopted)
      expect(yield* service.get({ type: "apex_external_ref", value: expected.apexExternalRef })).toEqual(adopted)
      expect(yield* service.get({ type: "session", value: expected.sessionID })).toEqual(adopted)
      expect((yield* stored).length).toBe(1)
    }),
  )

  it.effect("does not create a binding when the session or binding is absent", () =>
    Effect.gen(function* () {
      const expected = identity()
      const service = yield* TaskBinding.Service

      expect(yield* service.adopt(expected).pipe(Effect.flip)).toBeInstanceOf(TaskBinding.SessionNotFoundError)
      expect(yield* stored).toEqual([])

      yield* seedSession(expected)
      expect(yield* service.resume(expected).pipe(Effect.flip)).toEqual(
        new TaskBinding.NotFoundError({ ref: { type: "mt_task", value: expected.mtTaskID } }),
      )
      expect(yield* stored).toEqual([])
    }),
  )

  it.effect("rejects persisted session project and location mismatches before writing", () =>
    Effect.gen(function* () {
      const expected = identity()
      const service = yield* TaskBinding.Service
      yield* seedSession(expected, {
        projectID: ProjectV2.ID.make("other-project"),
        directory: AbsolutePath.make("/other/worktree"),
        workspaceID: WorkspaceV2.ID.make("wrk_other_workspace"),
      })

      const error = yield* service.adopt(expected).pipe(Effect.flip)
      expect(error).toBeInstanceOf(TaskBinding.ConflictError)
      if (error instanceof TaskBinding.ConflictError) {
        expect(error.fields).toEqual(["projectID", "location.directory", "location.workspaceID"])
        expect(error.expected).toEqual(expected)
      }
      expect(yield* stored).toEqual([])
    }),
  )

  it.effect("rejects every task, session, and checkout divergence without changing the stored binding", () =>
    Effect.gen(function* () {
      const expected = identity()
      const service = yield* TaskBinding.Service
      yield* seedSession(expected)
      yield* service.adopt(expected)
      const before = yield* stored

      const otherSession = TaskBinding.Identity.make({
        ...expected,
        sessionID: SessionSchema.ID.make("ses_other_task_binding"),
      })
      yield* seedSession(otherSession)

      const variations: ReadonlyArray<{ binding: TaskBinding.Identity; field: TaskBinding.Field }> = [
        { binding: TaskBinding.Identity.make({ ...expected, mtTaskID: "DA20-099" }), field: "mtTaskID" },
        {
          binding: TaskBinding.Identity.make({ ...expected, apexExternalRef: ".project/tasks/DA20-099" }),
          field: "apexExternalRef",
        },
        { binding: otherSession, field: "sessionID" },
        {
          binding: TaskBinding.Identity.make({
            ...expected,
            checkout: TaskBinding.Checkout.make({ ...expected.checkout, repository: AbsolutePath.make("/other") }),
          }),
          field: "repository",
        },
        {
          binding: TaskBinding.Identity.make({
            ...expected,
            checkout: TaskBinding.Checkout.make({ ...expected.checkout, branch: "other-branch" }),
          }),
          field: "branch",
        },
        {
          binding: TaskBinding.Identity.make({
            ...expected,
            checkout: TaskBinding.Checkout.make({
              ...expected.checkout,
              worktree: AbsolutePath.make("/repo/other-worktree"),
            }),
          }),
          field: "worktree",
        },
        {
          binding: TaskBinding.Identity.make({
            ...expected,
            checkout: TaskBinding.Checkout.make({ ...expected.checkout, head: "different-head" }),
          }),
          field: "head",
        },
      ]

      yield* Effect.forEach(
        variations,
        (variation) =>
          Effect.gen(function* () {
            const errors = yield* Effect.all([
              service.adopt(variation.binding).pipe(Effect.flip),
              service.resume(variation.binding).pipe(Effect.flip),
            ])
            errors.forEach((error) => {
              expect(error).toBeInstanceOf(TaskBinding.ConflictError)
              if (error instanceof TaskBinding.ConflictError) expect(error.fields).toEqual([variation.field])
            })
            expect(yield* stored).toEqual(before)
          }),
        { discard: true },
      )
    }),
  )
})
