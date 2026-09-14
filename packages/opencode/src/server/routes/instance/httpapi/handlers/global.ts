import { LocalContext } from "@opencode-ai/core/local-context"
import { Database } from "@opencode-ai/core/database/database"
import { Location } from "@opencode-ai/core/location"
import { AbsolutePath } from "@opencode-ai/core/schema"
import { SessionV2 } from "@opencode-ai/core/session"
import { TaskBinding } from "@opencode-ai/core/task-binding"
import { TaskBindingTable } from "@opencode-ai/core/task-binding/sql"
import { TaskExecutionEffectTable, TaskExecutionOwnershipTable } from "@opencode-ai/core/task-execution/sql"
import { TaskMetrics } from "@opencode-ai/core/task-metrics"
import { TaskOwnership } from "@opencode-ai/core/task-ownership"
import { RepositoryTopology } from "@opencode-ai/core/repository-topology"
import { TaskAuthority } from "@opencode-ai/core/task-authority"
import { TaskChat } from "@opencode-ai/schema/task-chat"
import { Session } from "@/session/session"
import { SessionID } from "@/session/schema"
import { Config } from "@/config/config"
import { GlobalBus, type GlobalEvent as GlobalBusEvent } from "@/bus/global"
import { EffectBridge } from "@/effect/bridge"
import { EventV2 } from "@opencode-ai/core/event"
import { Installation } from "@/installation"
import { disposeAllInstancesAndEmitGlobalDisposed } from "@/server/global-lifecycle"
import { InstallationVersion } from "@opencode-ai/core/installation/version"
import { Effect, Queue } from "effect"
import { asc, eq } from "drizzle-orm"
import * as Stream from "effect/Stream"
import { HttpServerResponse } from "effect/unstable/http"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import * as Sse from "effect/unstable/encoding/Sse"
import { RootHttpApi } from "../api"
import { GlobalUpgradeInput } from "../groups/global"

function eventData(data: unknown): Sse.Event {
  return {
    _tag: "Event",
    event: "message",
    id: undefined,
    data: JSON.stringify(data),
  }
}

function eventResponse() {
  return Effect.gen(function* () {
    yield* Effect.logInfo("global event connected")
    const events = Stream.callback<GlobalBusEvent>((queue) => {
      const handler = (event: GlobalBusEvent) => Queue.offerUnsafe(queue, event)
      return Effect.acquireRelease(
        Effect.sync(() => GlobalBus.on("event", handler)),
        () => Effect.sync(() => GlobalBus.off("event", handler)),
      )
    })
    const heartbeat = Stream.tick("10 seconds").pipe(
      Stream.drop(1),
      Stream.map(() => ({ payload: { id: EventV2.ID.create(), type: "server.heartbeat", properties: {} } })),
    )

    return HttpServerResponse.stream(
      Stream.make({ payload: { id: EventV2.ID.create(), type: "server.connected", properties: {} } }).pipe(
        Stream.concat(events.pipe(Stream.merge(heartbeat, { haltStrategy: "left" }))),
        Stream.map(eventData),
        Stream.pipeThroughChannel(Sse.encode()),
        Stream.encodeText,
        Stream.ensuring(Effect.logInfo("global event disconnected")),
      ),
      {
        contentType: "text/event-stream",
        headers: {
          "Cache-Control": "no-cache, no-transform",
          "X-Accel-Buffering": "no",
          "X-Content-Type-Options": "nosniff",
        },
      },
    )
  })
}

export const globalHandlers = HttpApiBuilder.group(RootHttpApi, "global", (handlers) =>
  Effect.gen(function* () {
    const localContext = yield* LocalContext.Service
    const { db } = yield* Database.Service
    const sessions = yield* Session.Service
    const sessionV2 = yield* SessionV2.Service
    const binding = yield* TaskBinding.Service
    const config = yield* Config.Service
    const installation = yield* Installation.Service
    const metrics = yield* TaskMetrics.Service
    const ownership = yield* TaskOwnership.Service
    const topology = yield* RepositoryTopology.Service
    const authority = yield* TaskAuthority.Service
    const bridge = yield* EffectBridge.make()

    const health = Effect.fn("GlobalHttpApi.health")(function* () {
      return { healthy: true as const, version: InstallationVersion }
    })

    const event = Effect.fn("GlobalHttpApi.event")(function* () {
      return yield* eventResponse()
    })

    const configGet = Effect.fn("GlobalHttpApi.configGet")(function* () {
      return yield* config.getGlobal()
    })

    const configUpdate = Effect.fn("GlobalHttpApi.configUpdate")(function* (ctx) {
      const result = yield* config.updateGlobal(ctx.payload)
      if (result.changed) bridge.fork(disposeAllInstancesAndEmitGlobalDisposed({ swallowErrors: true }))
      return result.info
    })

    const dispose = Effect.fn("GlobalHttpApi.dispose")(function* () {
      yield* disposeAllInstancesAndEmitGlobalDisposed()
      return true
    })

    const ownershipRead = Effect.fn("GlobalHttpApi.ownership")(function* (ctx: { payload: TaskOwnership.Input }) {
      return yield* ownership.read(ctx.payload)
    })

    const topologyRead = Effect.fn("GlobalHttpApi.topology")(function* (ctx: { payload: RepositoryTopology.Input }) {
      return yield* topology.read(ctx.payload)
    })

    const taskChatOpen = Effect.fn("GlobalHttpApi.taskChatOpen")(function* (ctx: { payload: TaskChat.OpenInput }) {
      const existing = yield* binding.get({ type: "mt_task", value: ctx.payload.mtTaskID })
      if (existing)
        return { sessionID: existing.sessionID, created: false, binding: existing }

      if (!matchesWorktreeConvention(ctx.payload.worktree, ctx.payload.mtTaskID))
        return yield* new TaskChat.WorktreeConvention({
          worktree: ctx.payload.worktree,
          mtTaskID: ctx.payload.mtTaskID,
        })

      const observed = yield* localContext.inspect({ directory: ctx.payload.worktree }).pipe(
        Effect.catch(() => new TaskChat.InspectFailed({ worktree: ctx.payload.worktree })),
      )
      if (observed.availability === "inaccessible")
        return yield* new TaskChat.InspectFailed({ worktree: ctx.payload.worktree })
      if (observed.availability !== "available")
        return yield* new TaskChat.WorktreeMissing({ worktree: ctx.payload.worktree })

      const directory = observed.canonical_directory ?? ctx.payload.worktree
      if (!matchesWorktreeConvention(directory, ctx.payload.mtTaskID))
        return yield* new TaskChat.WorktreeConvention({
          worktree: ctx.payload.worktree,
          mtTaskID: ctx.payload.mtTaskID,
        })
      if (
        !observed.git ||
        observed.git.status !== "available" ||
        !observed.git.top_level ||
        !observed.git.branch ||
        !observed.git.head
      )
        return yield* new TaskChat.WorktreeNotCheckout({ worktree: ctx.payload.worktree })

      const location = Location.Ref.make({ directory: AbsolutePath.make(directory) })
      const created = yield* sessionV2.create({ location })
      const adopted = yield* binding
        .adopt(
          TaskBinding.Identity.make({
            mtTaskID: ctx.payload.mtTaskID,
            apexExternalRef: ctx.payload.apexExternalRef,
            sessionID: created.id,
            projectID: created.projectID,
            location: created.location,
            checkout: TaskBinding.Checkout.make({
              repository: AbsolutePath.make(observed.git.top_level),
              branch: observed.git.branch,
              worktree: created.location.directory,
              head: observed.git.head,
            }),
          }),
        )
        .pipe(
          Effect.catchTag(
            "TaskBinding.ConflictError",
            (error) =>
              new TaskChat.ConflictError({
                fields: error.fields,
                expected: error.expected,
                observed: error.observed,
              }),
          ),
          Effect.catchTag(
            "TaskBinding.SessionNotFoundError",
            (error) => new TaskChat.SessionNotFoundError({ sessionID: error.sessionID }),
          ),
        )
      return { sessionID: adopted.sessionID, created: true, binding: adopted }
    })

    const metricsRead = Effect.fn("GlobalHttpApi.metrics")(function* (ctx: { payload: TaskMetrics.Request }) {
      if (ctx.payload.type === "task")
        return { type: "task" as const, metrics: yield* metrics.task({ taskID: ctx.payload.taskID }) }
      return {
        type: "sprint" as const,
        metrics: yield* metrics.sprint({
          sprintID: ctx.payload.sprintID,
          taskIDs: [...ctx.payload.taskIDs],
          ...(ctx.payload.queue ? { queue: ctx.payload.queue } : {}),
        }),
      }
    })

    const upgrade = Effect.fn("GlobalHttpApi.upgrade")(function* (ctx: { payload: typeof GlobalUpgradeInput.Type }) {
      const method = yield* installation.method()
      if (method === "unknown") {
        return HttpServerResponse.jsonUnsafe(
          { success: false as const, error: "Unknown installation method" },
          { status: 400 },
        )
      }
      const target = ctx.payload.target
      const result = yield* installation.upgrade(method, target).pipe(
        Effect.as({ success: true as const, version: target }),
        Effect.catch((err) =>
          Effect.succeed({
            success: false as const,
            error: err instanceof Error ? err.message : String(err),
          }),
        ),
      )
      if (!result.success) return HttpServerResponse.jsonUnsafe(result, { status: 500 })
      GlobalBus.emit("event", {
        directory: "global",
        payload: {
          type: Installation.Event.Updated.type,
          properties: { version: target },
        },
      })
      return HttpServerResponse.jsonUnsafe(result)
    })

    const context = Effect.fn("GlobalHttpApi.context")(function* (ctx: {
      query: { directory: string; base_ref?: string; session_id?: SessionID }
    }) {
      const session = ctx.query.session_id
        ? yield* sessions.get(ctx.query.session_id).pipe(
            Effect.map((value) => ({
              status: value.workspaceID ? ("workspace" as const) : ("found" as const),
              directory: value.directory,
            })),
            Effect.catch(() => Effect.succeed({ status: "missing" as const })),
            Effect.catchDefect(() => Effect.succeed({ status: "unavailable" as const })),
          )
        : undefined
      const task = ctx.query.session_id
        ? yield* db
            .select()
            .from(TaskBindingTable)
            .where(eq(TaskBindingTable.session_id, ctx.query.session_id))
            .get()
            .pipe(
              Effect.orDie,
              Effect.flatMap((binding) =>
                binding
                  ? Effect.all([
                      db
                        .select()
                        .from(TaskExecutionOwnershipTable)
                        .where(eq(TaskExecutionOwnershipTable.mt_task_id, binding.mt_task_id))
                        .get()
                        .pipe(Effect.orDie),
                      db
                        .select()
                        .from(TaskExecutionEffectTable)
                        .where(eq(TaskExecutionEffectTable.mt_task_id, binding.mt_task_id))
                        .orderBy(asc(TaskExecutionEffectTable.effect_id))
                        .all()
                        .pipe(Effect.orDie),
                    ]).pipe(
                      Effect.flatMap(([execution, effects]) =>
                        authority
                          .observe({
                            mtTaskID: binding.mt_task_id,
                            worktree: binding.worktree,
                            head: binding.head,
                          })
                          .pipe(
                            Effect.map((observation) => ({
                              binding: {
                                mtTaskID: binding.mt_task_id,
                                apexExternalRef: binding.apex_external_ref,
                                sessionID: binding.session_id,
                                projectID: binding.project_id,
                                location: {
                                  directory: binding.location_directory,
                                  workspaceID: binding.location_workspace_id,
                                },
                                checkout: {
                                  repository: binding.repository,
                                  branch: binding.branch,
                                  worktree: binding.worktree,
                                  head: binding.head,
                                },
                                version: binding.version as 1,
                              },
                              execution: execution
                                ? {
                                    mtTaskID: execution.mt_task_id,
                                    sessionID: execution.session_id,
                                    worktree: execution.worktree,
                                    ownerID: execution.owner_id,
                                    generation: execution.generation,
                                    effects: effects.map((effect) => ({
                                      effectID: effect.effect_id,
                                      state: effect.state,
                                    })),
                                  }
                                : null,
                              authority: observation,
                            })),
                          ),
                      ),
                    )
                  : Effect.succeed(undefined),
              ),
            )
        : undefined
      return {
        ...(yield* localContext.inspect({ directory: ctx.query.directory, base_ref: ctx.query.base_ref, session })),
        task,
      }
    })

    return handlers
      .handle("context", context)
      .handle("health", health)
      .handleRaw("event", event)
      .handle("configGet", configGet)
      .handle("configUpdate", configUpdate)
      .handle("dispose", dispose)
      .handle("metrics", metricsRead)
      .handle("ownership", ownershipRead)
      .handle("topology", topologyRead)
      .handle("taskChatOpen", taskChatOpen)
      .handle("upgrade", upgrade)
  }),
)

function matchesWorktreeConvention(worktree: string, mtTaskID: string) {
  const normalized = worktree.replaceAll("\\", "/").replace(/\/+$/, "")
  return normalized.endsWith(`/features/tasks/${mtTaskID}`)
}
