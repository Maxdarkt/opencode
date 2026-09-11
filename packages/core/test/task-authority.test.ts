import { expect } from "bun:test"
import fs from "fs/promises"
import path from "path"
import { Effect } from "effect"
import { AppNodeBuilder } from "@opencode-ai/core/effect/app-node-builder"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { Database } from "@opencode-ai/core/database/database"
import { Location } from "@opencode-ai/core/location"
import { ProjectV2 } from "@opencode-ai/core/project"
import { ProjectTable } from "@opencode-ai/core/project/sql"
import { TaskAuthority } from "@opencode-ai/core/task-authority"
import { TaskBinding } from "@opencode-ai/core/task-binding"
import { SessionSchema } from "@opencode-ai/core/session/schema"
import { SessionTable } from "@opencode-ai/core/session/sql"
import { AbsolutePath } from "@opencode-ai/core/schema"
import { tmpdir } from "./fixture/tmpdir"
import { testEffect } from "./lib/effect"

const it = testEffect(LayerNode.compile(TaskAuthority.node))
const queueIt = testEffect(
  AppNodeBuilder.build(LayerNode.group([Database.node, TaskBinding.node, TaskAuthority.node]), [
    [Database.node, Database.layerFromPath(":memory:")],
  ]),
)
const fixture = () =>
  Effect.acquireRelease(Effect.promise(tmpdir), (dir) => Effect.promise(() => dir[Symbol.asyncDispose]()))

const snapshot = (input: { expiresAt?: string; worktree?: string; head?: string; phase?: string } = {}) => ({
  schemaVersion: 2,
  generation: 3,
  authority: { business: "mt-tasks", phasesAndEvidence: "apex-task-folders" },
  observedAt: "2026-09-08T00:00:00.000Z",
  expiresAt: input.expiresAt ?? "2099-09-08T00:00:00.000Z",
  tasks: [
    {
      id: "DA30-008",
      mtStatus: "in_progress",
      apex: { phase: input.phase ?? "build" },
      git: { worktreePath: input.worktree ?? "/repo/worktree", head: input.head ?? "abc123" },
    },
  ],
})

const queueIdentity = (taskID: string, sessionID: string, input: { apexExternalRef?: string; head?: string } = {}) =>
  TaskBinding.Identity.make({
    mtTaskID: taskID,
    apexExternalRef: input.apexExternalRef ?? `.project/tasks/${taskID}`,
    sessionID: SessionSchema.ID.make(sessionID),
    projectID: ProjectV2.ID.make(`project-${taskID}`),
    location: Location.Ref.make({ directory: AbsolutePath.make(`/repo/${taskID.toLowerCase()}`) }),
    checkout: TaskBinding.Checkout.make({
      repository: AbsolutePath.make("/repo"),
      branch: `task-${taskID.toLowerCase()}`,
      worktree: AbsolutePath.make(`/repo/${taskID.toLowerCase()}`),
      head: input.head ?? `${taskID}-head`,
    }),
  })

const seedBinding = (identity: TaskBinding.Identity) =>
  Database.Service.use(({ db }) =>
    Effect.gen(function* () {
      yield* db
        .insert(ProjectTable)
        .values({ id: identity.projectID, worktree: identity.checkout.worktree, sandboxes: [] })
        .run()
      yield* db
        .insert(SessionTable)
        .values({
          id: identity.sessionID,
          project_id: identity.projectID,
          slug: identity.mtTaskID,
          directory: identity.location.directory,
          title: identity.mtTaskID,
          version: "test",
        })
        .run()
      const binding = yield* TaskBinding.Service
      yield* binding.adopt(identity)
    }),
  )

const queueSnapshot = (tasks: ReadonlyArray<unknown>, input: { expiresAt?: string } = {}) => ({
  schemaVersion: 2,
  generation: 9,
  authority: { business: "mt-tasks", phasesAndEvidence: "apex-task-folders" },
  observedAt: "2026-09-10T00:00:00.000Z",
  expiresAt: input.expiresAt ?? "2099-09-08T01:00:00.000Z",
  tasks,
})

const queueTask = (identity: TaskBinding.Identity, input: { mtStatus: string; phase?: string; head?: string }) => ({
  id: identity.mtTaskID,
  mtStatus: input.mtStatus,
  apex: { phase: input.phase ?? (input.mtStatus === "todo" ? "allocated" : "analyze") },
  git: { worktreePath: identity.checkout.worktree, head: input.head ?? identity.checkout.head },
})

it.live("projects only a fresh, identity-concordant MT/APEX observation", () =>
  Effect.gen(function* () {
    const root = yield* fixture()
    const snapshotPath = path.join(root.path, "CURRENT.json")
    const service = yield* TaskAuthority.Service
    yield* Effect.promise(() => fs.writeFile(snapshotPath, JSON.stringify(snapshot())))
    expect(
      yield* service.observe({ mtTaskID: "DA30-008", worktree: "/repo/worktree", head: "abc123", snapshotPath }),
    ).toMatchObject({ state: "available", mtStatus: "in_progress", apexPhase: "build", generation: 3 })
    expect(
      yield* service.observe({ mtTaskID: "DA30-008", worktree: "/repo/other", head: "abc123", snapshotPath }),
    ).toMatchObject({ state: "divergent" })
    yield* Effect.promise(() =>
      fs.writeFile(snapshotPath, JSON.stringify(snapshot({ expiresAt: "2026-09-08T01:00:00.000Z" }))),
    )
    expect(
      yield* service.observe({ mtTaskID: "DA30-008", worktree: "/repo/worktree", head: "abc123", snapshotPath }),
    ).toMatchObject({ state: "expired" })
  }),
)

queueIt.live("projects two exact bindings through A then B without transferring identity", () =>
  Effect.gen(function* () {
    const root = yield* fixture()
    const snapshotPath = path.join(root.path, "CURRENT.json")
    const a = queueIdentity("DA30-009-A", "ses_task_authority_a")
    const b = queueIdentity("DA30-009-B", "ses_task_authority_b")
    yield* seedBinding(a)
    yield* seedBinding(b)
    const service = yield* TaskAuthority.Service
    const input = { entries: [{ identity: a }, { identity: b }], snapshotPath }

    yield* Effect.promise(() =>
      fs.writeFile(
        snapshotPath,
        JSON.stringify(
          queueSnapshot([
            queueTask(a, { mtStatus: "in_progress", phase: "analyze" }),
            queueTask(b, { mtStatus: "todo" }),
          ]),
        ),
      ),
    )
    expect(yield* service.observeQueue(input)).toMatchObject({
      state: "available",
      result: { kind: "selected", id: a.mtTaskID, action: "write_plan" },
      entries: [{ id: a.mtTaskID }, { id: b.mtTaskID }],
    })

    yield* Effect.promise(() =>
      fs.writeFile(
        snapshotPath,
        JSON.stringify(
          queueSnapshot([
            queueTask(a, { mtStatus: "review", phase: "verify" }),
            queueTask(b, { mtStatus: "todo" }),
          ]),
        ),
      ),
    )
    expect(yield* service.observeQueue(input)).toMatchObject({
      state: "available",
      result: { kind: "selected", id: b.mtTaskID, action: "start_analyze" },
    })
  }),
)

queueIt.live("fails closed for snapshot and binding divergence without selecting a task", () =>
  Effect.gen(function* () {
    const root = yield* fixture()
    const snapshotPath = path.join(root.path, "CURRENT.json")
    const a = queueIdentity("DA30-009-C", "ses_task_authority_c")
    const b = queueIdentity("DA30-009-D", "ses_task_authority_d")
    yield* seedBinding(a)
    yield* seedBinding(b)
    const service = yield* TaskAuthority.Service
    const input = { entries: [{ identity: a }, { identity: b }], snapshotPath }

    yield* Effect.promise(() =>
      fs.writeFile(
        snapshotPath,
        JSON.stringify(
          queueSnapshot([
            queueTask(a, { mtStatus: "in_progress", phase: "analyze" }),
            queueTask(b, { mtStatus: "todo", phase: "verify", head: "wrong-head" }),
          ]),
        ),
      ),
    )
    expect(yield* service.observeQueue(input)).toMatchObject({ state: "divergent", result: { kind: "blocked" } })

    const wrongApex = TaskBinding.Identity.make({ ...b, apexExternalRef: ".project/tasks/wrong" })
    expect(yield* service.observeQueue({ entries: [{ identity: a }, { identity: wrongApex }], snapshotPath })).toMatchObject({
      state: "divergent",
      result: { kind: "blocked" },
    })

    yield* Effect.promise(() =>
      fs.writeFile(
        snapshotPath,
        JSON.stringify(queueSnapshot([queueTask(a, { mtStatus: "in_progress", phase: "analyze" })])),
      ),
    )
    expect(yield* service.observeQueue(input)).toMatchObject({ state: "absent", result: { kind: "blocked" } })

    yield* Effect.promise(() =>
      fs.writeFile(
        snapshotPath,
        JSON.stringify(
          queueSnapshot([
            queueTask(a, { mtStatus: "in_progress", phase: "analyze" }),
            queueTask(a, { mtStatus: "todo", phase: "verify" }),
          ]),
        ),
      ),
    )
    expect(yield* service.observeQueue({ entries: [{ identity: a }], snapshotPath })).toMatchObject({
      state: "invalid",
      result: { kind: "blocked", reason: "duplicate_task_id" },
    })

    yield* Effect.promise(() =>
      fs.writeFile(snapshotPath, JSON.stringify(queueSnapshot([], { expiresAt: "2026-09-10T01:00:00.000Z" }))),
    )
    expect(yield* service.observeQueue(input)).toMatchObject({ state: "expired", result: { kind: "blocked" } })
  }),
)

queueIt.live("blocks two active tasks at the queue evaluator boundary", () =>
  Effect.gen(function* () {
    const root = yield* fixture()
    const snapshotPath = path.join(root.path, "CURRENT.json")
    const a = queueIdentity("DA30-009-E", "ses_task_authority_e")
    const b = queueIdentity("DA30-009-F", "ses_task_authority_f")
    yield* seedBinding(a)
    yield* seedBinding(b)
    yield* Effect.promise(() =>
      fs.writeFile(
        snapshotPath,
        JSON.stringify(
          queueSnapshot([
            queueTask(a, { mtStatus: "in_progress", phase: "analyze" }),
            queueTask(b, { mtStatus: "in_progress", phase: "analyze" }),
          ]),
        ),
      ),
    )
    expect(
      yield* (yield* TaskAuthority.Service).observeQueue({ entries: [{ identity: a }, { identity: b }], snapshotPath }),
    ).toMatchObject({ state: "blocked", result: { kind: "blocked", reason: "multiple_active" } })
  }),
)
