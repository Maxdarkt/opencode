import { LocalContext } from "@opencode-ai/core/local-context"
import { Database } from "@opencode-ai/core/database/database"
import { AppNodeBuilder } from "@opencode-ai/core/effect/app-node-builder"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { EventV2 } from "@opencode-ai/core/event"
import { ModelV2 } from "@opencode-ai/core/model"
import { ProjectV2 } from "@opencode-ai/core/project"
import { ProjectSchema } from "@opencode-ai/core/project/schema"
import { ProjectTable } from "@opencode-ai/core/project/sql"
import { ProviderV2 } from "@opencode-ai/core/provider"
import { AbsolutePath } from "@opencode-ai/core/schema"
import { SessionV2 } from "@opencode-ai/core/session"
import { SessionExecution } from "@opencode-ai/core/session/execution"
import { SessionMessage } from "@opencode-ai/core/session/message"
import { SessionProjector } from "@opencode-ai/core/session/projector"
import { SessionSchema } from "@opencode-ai/core/session/schema"
import { SessionStore } from "@opencode-ai/core/session/store"
import { SessionMessageTable, SessionTable } from "@opencode-ai/core/session/sql"
import { TaskBinding } from "@opencode-ai/core/task-binding"
import { TaskBindingTable } from "@opencode-ai/core/task-binding/sql"
import { TaskExecutionEffectTable, TaskExecutionOwnershipTable } from "@opencode-ai/core/task-execution/sql"
import { TaskMetrics } from "@opencode-ai/core/task-metrics"
import { TaskOwnership } from "@opencode-ai/core/task-ownership"
import { RepositoryTopology } from "@opencode-ai/core/repository-topology"
import { TaskAuthority } from "@opencode-ai/core/task-authority"
import { Session } from "@/session/session"
import { execFile } from "child_process"
import { mkdir } from "fs/promises"
import path from "path"
import { promisify } from "util"
import { tmpdir } from "../fixture/fixture"
import { NodeHttpServer } from "@effect/platform-node"
import { describe, expect } from "bun:test"
import { Context, DateTime, Effect, Layer, Option, Schema } from "effect"
import { HttpBody, HttpClient, HttpClientRequest, HttpRouter } from "effect/unstable/http"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { Auth } from "../../src/auth"
import { Config } from "../../src/config/config"
import { Installation } from "../../src/installation"
import { MoveSession } from "@opencode-ai/core/control-plane/move-session"
import { ServerAuth } from "../../src/server/auth"
import { RootHttpApi } from "../../src/server/routes/instance/httpapi/api"
import { GlobalPaths } from "../../src/server/routes/instance/httpapi/groups/global"
import { controlHandlers } from "../../src/server/routes/instance/httpapi/handlers/control"
import { controlPlaneHandlers } from "../../src/server/routes/instance/httpapi/handlers/control-plane"
import { globalHandlers } from "../../src/server/routes/instance/httpapi/handlers/global"
import { authorizationLayer } from "../../src/server/routes/instance/httpapi/middleware/authorization"
import { schemaErrorLayer } from "../../src/server/routes/instance/httpapi/middleware/schema-error"
import { testEffect } from "../lib/effect"

const metricsLayer = AppNodeBuilder.build(
  LayerNode.group([
    Database.node,
    TaskMetrics.node,
    TaskOwnership.node,
    RepositoryTopology.node,
    TaskBinding.node,
    EventV2.node,
    SessionProjector.node,
    SessionStore.node,
    SessionV2.node,
    LocalContext.node,
  ]),
  [
    [Database.node, Database.layerFromPath(":memory:")],
    [SessionExecution.node, SessionExecution.noopLayer],
    [
      ProjectV2.node,
      Layer.succeed(
        ProjectV2.Service,
        ProjectV2.Service.of({
          resolve: (directory) => Effect.succeed({ id: ProjectV2.ID.global, directory }),
          directories: () => Effect.succeed([]),
          commit: () => Effect.void,
        }),
      ),
    ],
  ],
)
const exec = promisify(execFile)
const encode = Schema.encodeSync(SessionMessage.Message)
const projectID = ProjectSchema.ID.make("project-httpapi-metrics")
const sessionID = (taskID: string) => SessionSchema.ID.make(`ses_httpapi_metrics_${taskID}`)

const assistant = (input: {
  taskID: string
  completed?: number
  cost?: number
  tokens?: SessionMessage.Assistant["tokens"]
}) =>
  SessionMessage.Assistant.make({
    id: SessionMessage.ID.make(`msg_httpapi_metrics_${input.taskID}`),
    type: "assistant",
    agent: "build",
    model: { providerID: ProviderV2.ID.make("provider"), id: ModelV2.ID.make("model") },
    content: [],
    ...(input.cost === undefined ? {} : { cost: input.cost }),
    ...(input.tokens === undefined ? {} : { tokens: input.tokens }),
    time: {
      created: DateTime.makeUnsafe(100),
      ...(input.completed === undefined ? {} : { completed: DateTime.makeUnsafe(input.completed) }),
    },
  })

const seed = (input: { taskID: string; message: SessionMessage.Assistant }) =>
  Database.Service.use(({ db }) => {
    const message = encode(input.message)
    const { id, type, ...data } = message
    return Effect.gen(function* () {
      yield* db
        .insert(ProjectTable)
        .values({ id: projectID, worktree: AbsolutePath.make("/repo/worktree"), sandboxes: [] })
        .onConflictDoNothing()
        .run()
      yield* db
        .insert(SessionTable)
        .values({
          id: sessionID(input.taskID),
          project_id: projectID,
          slug: input.taskID,
          directory: AbsolutePath.make("/repo/worktree"),
          title: input.taskID,
          version: "test",
        })
        .run()
      yield* db
        .insert(TaskBindingTable)
        .values({
          mt_task_id: input.taskID,
          apex_external_ref: `.project/tasks/${input.taskID}`,
          session_id: sessionID(input.taskID),
          project_id: projectID,
          location_directory: AbsolutePath.make("/repo/worktree"),
          repository: AbsolutePath.make("/repo"),
          branch: "task-metrics",
          worktree: AbsolutePath.make("/repo/worktree"),
          head: "1234567",
          version: 1,
        })
        .run()
      yield* db
        .insert(SessionMessageTable)
        .values({
          id: SessionMessage.ID.make(id),
          type,
          session_id: sessionID(input.taskID),
          seq: 1,
          time_created: 100,
          data,
        })
        .run()
    })
  })

const apiLayer = HttpRouter.serve(
  HttpApiBuilder.layer(RootHttpApi).pipe(
    Layer.provide([controlHandlers, controlPlaneHandlers, globalHandlers]),
    Layer.provide([authorizationLayer, schemaErrorLayer]),
    // Raw HttpApi routes expose an opaque handler context at the request boundary.
    // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion
    HttpRouter.provideRequest(Layer.succeedContext(Context.empty() as Context.Context<unknown>)),
  ),
  { disableListenLog: true, disableLogger: true },
).pipe(
  Layer.provideMerge(NodeHttpServer.layerTest),
  Layer.provideMerge(metricsLayer),
  Layer.provide(Layer.mock(Auth.Service)({})),
  Layer.provide(Layer.mock(Config.Service)({})),
  Layer.provide(Layer.mock(TaskAuthority.Service)({})),
  Layer.provide(Layer.mock(Session.Service)({})),
  Layer.provide(Layer.mock(MoveSession.Service)({})),
  Layer.provide(
    Layer.mock(Installation.Service)({
      method: () => Effect.succeed("npm"),
      latest: () => Effect.succeed("9.9.9"),
      upgrade: () => Effect.void,
    }),
  ),
  Layer.provide(ServerAuth.Config.configLayer({ password: Option.none(), username: "opencode" })),
)
const it = testEffect(apiLayer)

describe("global HttpApi", () => {
  it.live("smokes measured task metrics without turning an unproven cost into zero", () =>
    Effect.gen(function* () {
      yield* seed({
        taskID: "DA30-007",
        message: assistant({
          taskID: "DA30-007",
          completed: 160,
          cost: 0,
          tokens: { input: 10, output: 5, reasoning: 2, cache: { read: 3, write: 1 } },
        }),
      })
      const response = yield* HttpClientRequest.post(GlobalPaths.metrics).pipe(
        HttpClientRequest.bodyJsonUnsafe({ type: "task", taskID: "DA30-007" }),
        HttpClient.execute,
      )

      expect(response.status).toBe(200)
      const body = yield* response.json
      expect(body).toMatchObject({
        type: "task",
        metrics: {
          taskID: "DA30-007",
          models: { state: "measured", value: [{ providerID: "provider", id: "model" }] },
          tokens: { state: "measured", value: { input: 10, output: 5, reasoning: 2 } },
          latency: { state: "measured", value: 60 },
          cost: { state: "unknown" },
        },
      })
      expect("value" in (body as { metrics: { cost: object } }).metrics.cost).toBe(false)
    }),
  )

  it.live("smokes distinct A/B sprint metrics without a false zero cost", () =>
    Effect.gen(function* () {
      yield* seed({
        taskID: "DA30-010-A",
        message: assistant({
          taskID: "DA30-010-A",
          completed: 160,
          cost: 0,
          tokens: { input: 10, output: 1, reasoning: 0, cache: { read: 0, write: 0 } },
        }),
      })
      yield* seed({
        taskID: "DA30-010-B",
        message: assistant({
          taskID: "DA30-010-B",
          completed: 180,
          cost: 0,
          tokens: { input: 4, output: 2, reasoning: 0, cache: { read: 0, write: 0 } },
        }),
      })
      const response = yield* HttpClientRequest.post(GlobalPaths.metrics).pipe(
        HttpClientRequest.bodyJsonUnsafe({
          type: "sprint",
          sprintID: "sprint-ab",
          taskIDs: ["DA30-010-A", "DA30-010-B"],
        }),
        HttpClient.execute,
      )

      expect(response.status).toBe(200)
      const body = yield* response.json
      expect(body).toMatchObject({
        type: "sprint",
        metrics: {
          taskIDs: ["DA30-010-A", "DA30-010-B"],
          tasks: [{ taskID: "DA30-010-A" }, { taskID: "DA30-010-B" }],
          tokens: { state: "measured", value: { input: 14, output: 3 } },
          cost: { state: "unknown" },
        },
      })
      expect("value" in (body as { metrics: { cost: object } }).metrics.cost).toBe(false)
      expect("attention" in (body as { metrics: object }).metrics).toBe(false)
    }),
  )

  it.live("rejects a blocked sprint queue without inventing totals", () =>
    Effect.gen(function* () {
      const response = yield* HttpClientRequest.post(GlobalPaths.metrics).pipe(
        HttpClientRequest.bodyJsonUnsafe({
          type: "sprint",
          sprintID: "sprint-q",
          taskIDs: ["DA30-010-Q", "DA30-010-R"],
          queue: [
            { id: "DA30-010-Q", mtStatus: "todo", context: "concordant" },
            { id: "DA30-010-Q", mtStatus: "todo", context: "concordant" },
          ],
        }),
        HttpClient.execute,
      )

      expect(response.status).toBe(409)
      expect(yield* response.json).toMatchObject({
        _tag: "TaskMetrics.QueueBlocked",
        reason: "duplicate_task_id",
      })
    }),
  )

  it.live("smokes an incomplete sprint while retaining the unbound task", () =>
    Effect.gen(function* () {
      yield* seed({
        taskID: "DA30-008",
        message: assistant({
          taskID: "DA30-008",
          tokens: { input: 7, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
        }),
      })
      const response = yield* HttpClientRequest.post(GlobalPaths.metrics).pipe(
        HttpClientRequest.bodyJsonUnsafe({
          type: "sprint",
          sprintID: "sprint-3",
          taskIDs: ["DA30-008", "missing", "DA30-008"],
        }),
        HttpClient.execute,
      )

      expect(response.status).toBe(200)
      expect(yield* response.json).toMatchObject({
        type: "sprint",
        metrics: {
          taskIDs: ["DA30-008", "missing"],
          duplicateTaskIDs: ["DA30-008"],
          tasks: [{ taskID: "DA30-008" }, { taskID: "missing" }],
          tokens: { state: "partial" },
          latency: { state: "partial" },
          cost: { state: "unknown" },
        },
      })
    }),
  )

  it.live("rejects invalid metrics payloads", () =>
    Effect.gen(function* () {
      const response = yield* HttpClientRequest.post(GlobalPaths.metrics).pipe(
        HttpClientRequest.bodyJsonUnsafe({ type: "sprint", sprintID: "S30" }),
        HttpClient.execute,
      )

      expect(response.status).toBe(400)
    }),
  )

  it.live("upgrades to the requested version", () =>
    Effect.gen(function* () {
      const response = yield* HttpClientRequest.post(GlobalPaths.upgrade).pipe(
        HttpClientRequest.bodyJsonUnsafe({ target: "9.9.9" }),
        HttpClient.execute,
      )

      expect(response.status).toBe(200)
      expect(yield* response.json).toEqual({ success: true, version: "9.9.9" })
    }),
  )

  it.live("rejects invalid upgrade payloads", () =>
    Effect.gen(function* () {
      const response = yield* HttpClientRequest.post(GlobalPaths.upgrade).pipe(
        HttpClientRequest.bodyJsonUnsafe({ target: 1 }),
        HttpClient.execute,
      )

      expect(response.status).toBe(400)
    }),
  )

  it.live("rejects invalid upgrade target versions", () =>
    Effect.gen(function* () {
      const response = yield* HttpClientRequest.post(GlobalPaths.upgrade).pipe(
        HttpClientRequest.bodyJsonUnsafe({ target: "latest" }),
        HttpClient.execute,
      )

      expect(response.status).toBe(400)
    }),
  )

  it.live("rejects unsupported upgrade content types", () =>
    Effect.gen(function* () {
      const response = yield* HttpClientRequest.post(GlobalPaths.upgrade).pipe(
        HttpClientRequest.setBody(HttpBody.text('{"target":"1.0.0"}', "text/plain")),
        HttpClient.execute,
      )

      expect(response.status).toBe(415)
    }),
  )

  const identityPayload = (taskID: string, worktree = "/repo/worktree") => ({
    mtTaskID: taskID,
    apexExternalRef: `.project/tasks/${taskID}`,
    sessionID: sessionID(taskID),
    projectID,
    location: { directory: worktree },
    checkout: {
      repository: "/repo",
      branch: "task-metrics",
      worktree,
      head: "1234567",
    },
  })

  const countRows = Effect.gen(function* () {
    const { db } = yield* Database.Service
    const bindings = yield* db.select().from(TaskBindingTable).all()
    const sessions = yield* db.select().from(SessionTable).all()
    const ownership = yield* db.select().from(TaskExecutionOwnershipTable).all()
    const effects = yield* db.select().from(TaskExecutionEffectTable).all()
    return {
      bindings: bindings.length,
      sessions: sessions.length,
      ownership: ownership.length,
      effects: effects.length,
    }
  })

  it.live("smokes distinct A/B ownership without inventing zeros or writing bindings", () =>
    Effect.gen(function* () {
      yield* seed({
        taskID: "DA10-005-A",
        message: assistant({ taskID: "DA10-005-A" }),
      })
      yield* seed({
        taskID: "DA10-005-B",
        message: assistant({ taskID: "DA10-005-B" }),
      })
      const before = yield* countRows
      const response = yield* HttpClientRequest.post(GlobalPaths.ownership).pipe(
        HttpClientRequest.bodyJsonUnsafe({
          entries: [
            { identity: identityPayload("DA10-005-A") },
            { identity: identityPayload("DA10-005-B") },
          ],
        }),
        HttpClient.execute,
      )
      expect(response.status).toBe(200)
      const body = yield* response.json
      expect(body).toMatchObject({
        entries: [
          {
            identity: { mtTaskID: "DA10-005-A" },
            binding: { state: "available", value: { mtTaskID: "DA10-005-A" } },
          },
          {
            identity: { mtTaskID: "DA10-005-B" },
            binding: { state: "available", value: { mtTaskID: "DA10-005-B" } },
          },
        ],
      })
      expect(yield* countRows).toEqual(before)
    }),
  )

  it.live("keeps a missing ownership identity absent or unknown instead of zero", () =>
    Effect.gen(function* () {
      const response = yield* HttpClientRequest.post(GlobalPaths.ownership).pipe(
        HttpClientRequest.bodyJsonUnsafe({
          entries: [{ identity: identityPayload("missing-task", "/repo/missing") }],
        }),
        HttpClient.execute,
      )
      expect(response.status).toBe(200)
      const body = (yield* response.json) as {
        entries: Array<{ binding: { state: string; value?: unknown }; execution: { state: string } }>
      }
      expect(body.entries[0].binding.state).toBe("absent")
      expect("value" in body.entries[0].binding).toBe(false)
      expect(body.entries[0].execution.state === "absent" || body.entries[0].execution.state === "unknown").toBe(true)
      expect(JSON.stringify(body).includes('"value":0')).toBe(false)
    }),
  )

  it.live("rejects invalid ownership payloads", () =>
    Effect.gen(function* () {
      const response = yield* HttpClientRequest.post(GlobalPaths.ownership).pipe(
        HttpClientRequest.bodyJsonUnsafe({ entries: "nope" }),
        HttpClient.execute,
      )
      expect(response.status).toBe(400)
    }),
  )

  it.live("marks empty mergeTarget invalid without writing git or execution rows", () =>
    Effect.gen(function* () {
      const dir = yield* Effect.acquireRelease(
        Effect.promise(() => tmpdir({ git: true })),
        (tmp) => Effect.promise(() => tmp[Symbol.asyncDispose]()),
      )
      yield* Effect.promise(() => exec("git", ["branch", "-M", "main"], { cwd: dir.path }))
      const before = yield* countRows
      const ownership = yield* HttpClientRequest.post(GlobalPaths.ownership).pipe(
        HttpClientRequest.bodyJsonUnsafe({ entries: [] }),
        HttpClient.execute,
      )
      expect(ownership.status).toBe(200)
      const snapshot = yield* ownership.json
      const response = yield* HttpClientRequest.post(GlobalPaths.topology).pipe(
        HttpClientRequest.bodyJsonUnsafe({
          ownership: snapshot,
          repositories: [{ root: dir.path, sourceRefs: ["main"], mergeTarget: "" }],
        }),
        HttpClient.execute,
      )
      expect(response.status).toBe(200)
      const body = (yield* response.json) as {
        repositories: Array<{ worktrees: Array<{ mergeTarget: { state: string }; ahead: { state: string } }> }>
      }
      const worktree = body.repositories[0].worktrees[0]
      expect(worktree.mergeTarget.state).toBe("invalid")
      expect(worktree.ahead.state).toBe("invalid")
      expect(yield* countRows).toEqual(before)
    }),
  )

  it.live("rejects invalid topology payloads", () =>
    Effect.gen(function* () {
      const response = yield* HttpClientRequest.post(GlobalPaths.topology).pipe(
        HttpClientRequest.bodyJsonUnsafe({ repositories: [] }),
        HttpClient.execute,
      )
      expect(response.status).toBe(400)
    }),
  )

  const openPayload = (taskID: string, worktree: string, apex = `.project/tasks/${taskID}`) => ({
    mtTaskID: taskID,
    apexExternalRef: apex,
    worktree,
  })

  const conventionTree = (taskID: string, git = true) =>
    Effect.acquireRelease(
      Effect.promise(async () => {
        const tmp = await tmpdir()
        const worktree = path.join(tmp.path, "features", "tasks", taskID)
        await mkdir(worktree, { recursive: true })
        if (git) {
          await exec("git", ["init"], { cwd: worktree })
          await exec("git", ["config", "core.fsmonitor", "false"], { cwd: worktree })
          await exec("git", ["config", "commit.gpgsign", "false"], { cwd: worktree })
          await exec("git", ["config", "user.email", "test@opencode.test"], { cwd: worktree })
          await exec("git", ["config", "user.name", "Test"], { cwd: worktree })
          await exec("git", ["commit", "--allow-empty", "-m", "root"], { cwd: worktree })
          await exec("git", ["branch", "-M", "chat-worktree"], { cwd: worktree })
        }
        return { tmp, worktree }
      }),
      (dir) => Effect.promise(() => dir.tmp[Symbol.asyncDispose]()),
    )

  it.live("opens a task chat once then reopens the same session without a second binding", () =>
    Effect.gen(function* () {
      const tree = yield* conventionTree("DA10-007")
      const before = yield* countRows
      const created = yield* HttpClientRequest.post(GlobalPaths.taskChatOpen).pipe(
        HttpClientRequest.bodyJsonUnsafe(openPayload("DA10-007", tree.worktree)),
        HttpClient.execute,
      )
      expect(created.status).toBe(200)
      const createdBody = (yield* created.json) as { sessionID: string; created: boolean }
      expect(createdBody.created).toBe(true)
      expect(createdBody.sessionID).toBeTruthy()
      const afterCreate = yield* countRows
      expect(afterCreate.bindings).toBe(before.bindings + 1)
      expect(afterCreate.sessions).toBe(before.sessions + 1)
      expect(afterCreate.ownership).toBe(before.ownership)
      expect(afterCreate.effects).toBe(before.effects)

      const reopened = yield* HttpClientRequest.post(GlobalPaths.taskChatOpen).pipe(
        HttpClientRequest.bodyJsonUnsafe(openPayload("DA10-007", tree.worktree)),
        HttpClient.execute,
      )
      expect(reopened.status).toBe(200)
      const reopenedBody = (yield* reopened.json) as { sessionID: string; created: boolean }
      expect(reopenedBody.created).toBe(false)
      expect(reopenedBody.sessionID).toBe(createdBody.sessionID)
      expect(yield* countRows).toEqual(afterCreate)
    }),
  )

  it.live("refuses a missing worktree without writing bindings or execution", () =>
    Effect.gen(function* () {
      const before = yield* countRows
      const worktree = path.join("/tmp", "opencode-missing-task-chat", "features", "tasks", "DA10-007-missing")
      const response = yield* HttpClientRequest.post(GlobalPaths.taskChatOpen).pipe(
        HttpClientRequest.bodyJsonUnsafe(openPayload("DA10-007-missing", worktree)),
        HttpClient.execute,
      )
      expect(response.status).toBe(404)
      expect(yield* countRows).toEqual(before)
    }),
  )

  it.live("refuses a worktree outside the card convention", () =>
    Effect.gen(function* () {
      const dir = yield* Effect.acquireRelease(
        Effect.promise(() => tmpdir({ git: true })),
        (tmp) => Effect.promise(() => tmp[Symbol.asyncDispose]()),
      )
      const before = yield* countRows
      const response = yield* HttpClientRequest.post(GlobalPaths.taskChatOpen).pipe(
        HttpClientRequest.bodyJsonUnsafe(openPayload("DA10-007", dir.path)),
        HttpClient.execute,
      )
      expect(response.status).toBe(400)
      expect(yield* countRows).toEqual(before)
    }),
  )

  it.live("refuses a non-checkout directory on the convention path", () =>
    Effect.gen(function* () {
      const tree = yield* conventionTree("DA10-007-nogit", false)
      const before = yield* countRows
      const response = yield* HttpClientRequest.post(GlobalPaths.taskChatOpen).pipe(
        HttpClientRequest.bodyJsonUnsafe(openPayload("DA10-007-nogit", tree.worktree)),
        HttpClient.execute,
      )
      expect(response.status).toBe(400)
      expect(yield* countRows).toEqual(before)
    }),
  )

  it.live("refuses a colliding apex ref without a second binding row", () =>
    Effect.gen(function* () {
      yield* seed({
        taskID: "DA10-007-seed",
        message: assistant({ taskID: "DA10-007-seed" }),
      })
      const tree = yield* conventionTree("DA10-007-collide")
      const before = yield* countRows
      const response = yield* HttpClientRequest.post(GlobalPaths.taskChatOpen).pipe(
        HttpClientRequest.bodyJsonUnsafe(
          openPayload("DA10-007-collide", tree.worktree, ".project/tasks/DA10-007-seed"),
        ),
        HttpClient.execute,
      )
      expect(response.status).toBe(409)
      const after = yield* countRows
      expect(after.bindings).toBe(before.bindings)
      expect(after.ownership).toBe(before.ownership)
      expect(after.effects).toBe(before.effects)
    }),
  )

  it.live("rejects invalid task-chat payloads", () =>
    Effect.gen(function* () {
      const response = yield* HttpClientRequest.post(GlobalPaths.taskChatOpen).pipe(
        HttpClientRequest.bodyJsonUnsafe({ mtTaskID: "" }),
        HttpClient.execute,
      )
      expect(response.status).toBe(400)
    }),
  )
})
