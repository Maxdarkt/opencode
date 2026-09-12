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
import { AbsolutePath } from "@opencode-ai/core/schema"
import { SessionSchema } from "@opencode-ai/core/session/schema"
import { SessionTable } from "@opencode-ai/core/session/sql"
import { TaskAuthority } from "@opencode-ai/core/task-authority"
import { TaskBinding } from "@opencode-ai/core/task-binding"
import { TaskBindingTable } from "@opencode-ai/core/task-binding/sql"
import { TaskExecution } from "@opencode-ai/core/task-execution"
import { TaskExecutionEffectTable, TaskExecutionOwnershipTable } from "@opencode-ai/core/task-execution/sql"
import { TaskOwnership } from "@opencode-ai/core/task-ownership"
import { tmpdir } from "./fixture/tmpdir"
import { testEffect } from "./lib/effect"

const it = testEffect(
  AppNodeBuilder.build(
    LayerNode.group([
      Database.node,
      TaskBinding.node,
      TaskAuthority.node,
      TaskExecution.node,
      TaskOwnership.node,
    ]),
    [[Database.node, Database.layerFromPath(":memory:")]],
  ),
)

const fixture = () =>
  Effect.acquireRelease(Effect.promise(tmpdir), (dir) => Effect.promise(() => dir[Symbol.asyncDispose]()))

const identity = (taskID: string, sessionID: string) =>
  TaskBinding.Identity.make({
    mtTaskID: taskID,
    apexExternalRef: `.project/tasks/${taskID}`,
    sessionID: SessionSchema.ID.make(sessionID),
    projectID: ProjectV2.ID.make(`project-${taskID}`),
    location: Location.Ref.make({ directory: AbsolutePath.make(`/repo/${taskID.toLowerCase()}`) }),
    checkout: TaskBinding.Checkout.make({
      repository: AbsolutePath.make("/repo"),
      branch: `task-${taskID.toLowerCase()}`,
      worktree: AbsolutePath.make(`/repo/${taskID.toLowerCase()}`),
      head: `${taskID}-head`,
    }),
  })

const seedBinding = (expected: TaskBinding.Identity) =>
  Effect.gen(function* () {
    const { db } = yield* Database.Service
    yield* db
      .insert(ProjectTable)
      .values({ id: expected.projectID, worktree: expected.checkout.worktree, sandboxes: [] })
      .onConflictDoNothing()
      .run()
    yield* db
      .insert(SessionTable)
      .values({
        id: expected.sessionID,
        project_id: expected.projectID,
        slug: expected.mtTaskID.toLowerCase(),
        directory: expected.location.directory,
        title: expected.mtTaskID,
        version: "test",
      })
      .run()
    yield* TaskBinding.Service.use((service) => service.adopt(expected))
  })

const queueSnapshot = (tasks: ReadonlyArray<unknown>, input: { expiresAt?: string } = {}) => ({
  schemaVersion: 2,
  generation: 9,
  authority: { business: "mt-tasks", phasesAndEvidence: "apex-task-folders" },
  observedAt: "2026-09-10T00:00:00.000Z",
  expiresAt: input.expiresAt ?? "2099-09-08T01:00:00.000Z",
  tasks,
})

const queueTask = (expected: TaskBinding.Identity, input: { mtStatus: string; phase?: string; head?: string }) => ({
  id: expected.mtTaskID,
  mtStatus: input.mtStatus,
  apex: { phase: input.phase ?? (input.mtStatus === "todo" ? "allocated" : "analyze") },
  git: { worktreePath: expected.checkout.worktree, head: input.head ?? expected.checkout.head },
})

const writeSnapshot = (snapshotPath: string, tasks: ReadonlyArray<unknown>, input: { expiresAt?: string } = {}) =>
  Effect.promise(() => fs.writeFile(snapshotPath, JSON.stringify(queueSnapshot(tasks, input))))

const attention = (sourceTaskID: string, id: string) =>
  TaskOwnership.Attention.make({
    sourceTaskID,
    id,
    kind: "signal",
    provenance: TaskOwnership.Provenance.make({ source: "attention_input", reference: sourceTaskID }),
    freshness: TaskOwnership.Freshness.make({}),
  })

const ownershipRows = Database.Service.use(({ db }) => db.select().from(TaskExecutionOwnershipTable).all())
const effectRows = Database.Service.use(({ db }) => db.select().from(TaskExecutionEffectTable).all())
const bindingRows = Database.Service.use(({ db }) => db.select().from(TaskBindingTable).all())

it.live("re-exports the canonical Schema contracts", () =>
  Effect.gen(function* () {
    const schema = yield* Effect.promise(() => import("@opencode-ai/schema/task-ownership"))
    expect(TaskOwnership.Snapshot).toBe(schema.TaskOwnership.Snapshot)
    expect(TaskOwnership.Entry).toBe(schema.TaskOwnership.Entry)
  }),
)

it.live("projects A then B without transferring ownership, session or attention", () =>
  Effect.gen(function* () {
    const root = yield* fixture()
    const snapshotPath = path.join(root.path, "CURRENT.json")
    const a = identity("DA20-004-A", "ses_ownership_a")
    const b = identity("DA20-004-B", "ses_ownership_b")
    yield* seedBinding(a)
    yield* seedBinding(b)
    const execution = yield* TaskExecution.Service
    const ownerA = yield* execution.acquire(a, TaskExecution.OwnerID.make("owner-a"))
    const ownerB = yield* execution.acquire(b, TaskExecution.OwnerID.make("owner-b"))
    const service = yield* TaskOwnership.Service
    const input = TaskOwnership.Input.make({
      entries: [{ identity: a }, { identity: b }],
      snapshotPath,
    })

    yield* writeSnapshot(snapshotPath, [
      queueTask(a, { mtStatus: "in_progress", phase: "analyze" }),
      queueTask(b, { mtStatus: "todo" }),
    ])
    const first = yield* service.read(input)
    expect(first.state).toBe("available")
    expect(first.result).toMatchObject({ kind: "selected", id: a.mtTaskID })
    expect(first.entries.map((entry) => entry.identity.mtTaskID)).toEqual([a.mtTaskID, b.mtTaskID])
    expect(first.entries[0].execution).toMatchObject({
      state: "available",
      value: { mtTaskID: a.mtTaskID, sessionID: a.sessionID, worktree: a.checkout.worktree, ownerID: ownerA.ownerID },
    })
    expect(first.entries[1].execution).toMatchObject({
      state: "available",
      value: { mtTaskID: b.mtTaskID, sessionID: b.sessionID, worktree: b.checkout.worktree, ownerID: ownerB.ownerID },
    })
    expect(first.entries[0].attention.state).toBe("unknown")
    expect(first.entries[1].attention.state).toBe("unknown")

    yield* writeSnapshot(snapshotPath, [
      queueTask(a, { mtStatus: "review", phase: "verify" }),
      queueTask(b, { mtStatus: "todo" }),
    ])
    const second = yield* service.read(input)
    expect(second.result).toMatchObject({ kind: "selected", id: b.mtTaskID })
    expect(second.entries[0].execution).toMatchObject({
      state: "available",
      value: { ownerID: ownerA.ownerID, sessionID: a.sessionID, worktree: a.checkout.worktree },
    })
    expect(second.entries[1].execution).toMatchObject({
      state: "available",
      value: { ownerID: ownerB.ownerID, sessionID: b.sessionID, worktree: b.checkout.worktree },
    })
    expect(second.entries[0].identity.checkout.worktree).toBe(a.checkout.worktree)
    expect(second.entries[1].identity.checkout.worktree).toBe(b.checkout.worktree)
  }),
)

it.live("refuses foreign attention on B without leaking A's facts", () =>
  Effect.gen(function* () {
    const root = yield* fixture()
    const snapshotPath = path.join(root.path, "CURRENT.json")
    const a = identity("DA20-004-C", "ses_ownership_c")
    const b = identity("DA20-004-D", "ses_ownership_d")
    yield* seedBinding(a)
    yield* seedBinding(b)
    yield* TaskExecution.Service.use((service) => service.acquire(a, TaskExecution.OwnerID.make("owner-c")))
    yield* writeSnapshot(snapshotPath, [
      queueTask(a, { mtStatus: "review", phase: "verify" }),
      queueTask(b, { mtStatus: "todo" }),
    ])
    const snapshot = yield* TaskOwnership.Service.use((service) =>
      service.read(
        TaskOwnership.Input.make({
          entries: [
            { identity: a, attention: [attention(a.mtTaskID, "attn-a")] },
            { identity: b, attention: [attention(a.mtTaskID, "attn-a")] },
          ],
          snapshotPath,
        }),
      ),
    )
    expect(snapshot.state).toBe("blocked")
    expect(snapshot.result).toMatchObject({ kind: "blocked", reason: "context_divergent" })
    expect(snapshot.entries[0].attention).toMatchObject({ state: "available" })
    expect(snapshot.entries[1].attention.state).toBe("invalid")
    expect("value" in snapshot.entries[1].attention).toBe(false)
    expect(snapshot.entries[0].execution).toMatchObject({
      state: "available",
      value: { mtTaskID: a.mtTaskID, ownerID: "owner-c" },
    })
    expect(snapshot.entries[1].execution.state).toBe("absent")
  }),
)

it.live("fails closed for divergent token, binding, expiry and duplicate ids without writing", () =>
  Effect.gen(function* () {
    const root = yield* fixture()
    const snapshotPath = path.join(root.path, "CURRENT.json")
    const a = identity("DA20-004-E", "ses_ownership_e")
    const b = identity("DA20-004-F", "ses_ownership_f")
    yield* seedBinding(a)
    yield* seedBinding(b)
    const { db } = yield* Database.Service
    yield* db
      .insert(TaskExecutionOwnershipTable)
      .values({
        mt_task_id: b.mtTaskID,
        session_id: a.sessionID,
        worktree: a.checkout.worktree,
        owner_id: "owner-leaked",
        generation: 1,
        time_created: Date.now(),
        time_updated: Date.now(),
      })
      .run()
    yield* writeSnapshot(snapshotPath, [
      queueTask(a, { mtStatus: "in_progress", phase: "analyze" }),
      queueTask(b, { mtStatus: "todo" }),
    ])
    const before = {
      ownership: yield* ownershipRows,
      effects: yield* effectRows,
      bindings: yield* bindingRows,
    }
    const service = yield* TaskOwnership.Service
    const divergent = yield* service.read(
      TaskOwnership.Input.make({ entries: [{ identity: a }, { identity: b }], snapshotPath }),
    )
    expect(divergent.state).toBe("blocked")
    expect(divergent.entries[1].execution.state).toBe("divergent")
    expect("value" in divergent.entries[1].execution).toBe(false)

    const missing = yield* service.read(
      TaskOwnership.Input.make({
        entries: [
          { identity: a },
          { identity: TaskBinding.Identity.make({ ...b, apexExternalRef: ".project/tasks/wrong" }) },
        ],
        snapshotPath,
      }),
    )
    expect(missing.entries[1].binding.state).toBe("divergent")
    expect(missing.state).toBe("divergent")

    yield* writeSnapshot(snapshotPath, [queueTask(a, { mtStatus: "in_progress", phase: "analyze" })], {
      expiresAt: "2026-09-10T01:00:00.000Z",
    })
    const expired = yield* service.read(
      TaskOwnership.Input.make({ entries: [{ identity: a }, { identity: b }], snapshotPath }),
    )
    expect(expired.state).toBe("expired")
    expect(expired.result.kind).toBe("blocked")

    yield* writeSnapshot(snapshotPath, [
      queueTask(a, { mtStatus: "in_progress", phase: "analyze" }),
      queueTask(a, { mtStatus: "todo" }),
    ])
    const duplicated = yield* service.read(TaskOwnership.Input.make({ entries: [{ identity: a }], snapshotPath }))
    expect(duplicated.result).toMatchObject({ kind: "blocked", reason: "duplicate_task_id" })

    expect(yield* ownershipRows).toEqual(before.ownership)
    expect(yield* effectRows).toEqual(before.effects)
    expect(yield* bindingRows).toEqual(before.bindings)
  }),
)

it.live("replays an identical read without mutating execution or binding rows", () =>
  Effect.gen(function* () {
    const root = yield* fixture()
    const snapshotPath = path.join(root.path, "CURRENT.json")
    const a = identity("DA20-004-G", "ses_ownership_g")
    const b = identity("DA20-004-H", "ses_ownership_h")
    yield* seedBinding(a)
    yield* seedBinding(b)
    yield* TaskExecution.Service.use((service) => service.acquire(a, TaskExecution.OwnerID.make("owner-g")))
    yield* writeSnapshot(snapshotPath, [
      queueTask(a, { mtStatus: "in_progress", phase: "analyze" }),
      queueTask(b, { mtStatus: "todo" }),
    ])
    const service = yield* TaskOwnership.Service
    const input = TaskOwnership.Input.make({ entries: [{ identity: a }, { identity: b }], snapshotPath })
    const first = yield* service.read(input)
    const rows = {
      ownership: yield* ownershipRows,
      effects: yield* effectRows,
      bindings: yield* bindingRows,
    }
    const second = yield* service.read(input)
    expect(second).toEqual(first)
    expect(yield* ownershipRows).toEqual(rows.ownership)
    expect(yield* effectRows).toEqual(rows.effects)
    expect(yield* bindingRows).toEqual(rows.bindings)
  }),
)
