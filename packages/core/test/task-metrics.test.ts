import { describe, expect } from "bun:test"
import { Database } from "@opencode-ai/core/database/database"
import { AppNodeBuilder } from "@opencode-ai/core/effect/app-node-builder"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { ModelV2 } from "@opencode-ai/core/model"
import { ProjectSchema } from "@opencode-ai/core/project/schema"
import { ProjectTable } from "@opencode-ai/core/project/sql"
import { SessionMessage } from "@opencode-ai/core/session/message"
import { SessionSchema } from "@opencode-ai/core/session/schema"
import { SessionMessageTable, SessionTable } from "@opencode-ai/core/session/sql"
import { TaskMetrics } from "@opencode-ai/core/task-metrics"
import { TaskBindingTable } from "@opencode-ai/core/task-binding/sql"
import { TaskQueue } from "@opencode-ai/core/task-queue"
import { ProviderV2 } from "@opencode-ai/core/provider"
import { AbsolutePath } from "@opencode-ai/core/schema"
import { DateTime, Effect, Schema } from "effect"
import { testEffect } from "./lib/effect"

const it = testEffect(AppNodeBuilder.build(LayerNode.group([Database.node, TaskMetrics.node])))
const encode = Schema.encodeSync(SessionMessage.Message)
const projectID = ProjectSchema.ID.make("project-task-metrics")
const sessionID = (taskID: string) => SessionSchema.ID.make(`ses_task_metrics_${taskID}`)

const assistant = (input: {
  taskID: string
  completed?: number
  cost?: number
  tokens?: SessionMessage.Assistant["tokens"]
}) =>
  SessionMessage.Assistant.make({
    id: SessionMessage.ID.make(`msg_task_metrics_${input.taskID}`),
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
        .values({
          id: projectID,
          worktree: AbsolutePath.make("/repo/worktree"),
          sandboxes: [],
        })
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

describe("TaskMetrics", () => {
  it.effect("reports a completed turn without turning an unproven cost into zero", () =>
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

      const metrics = yield* (yield* TaskMetrics.Service).task({ taskID: "DA30-007" })

      expect(metrics.models).toMatchObject({ state: "measured", value: [{ providerID: "provider", id: "model" }] })
      expect(metrics.tokens).toMatchObject({
        state: "measured",
        value: { input: 10, output: 5, reasoning: 2, cache: { read: 3, write: 1 } },
      })
      expect(metrics.latency).toMatchObject({ state: "measured", value: 60 })
      expect(metrics.cost.state).toBe("unknown")
      expect("value" in metrics.cost).toBe(false)
    }),
  )

  it.effect("keeps incomplete and missing tasks visible in a deduplicated sprint aggregate", () =>
    Effect.gen(function* () {
      yield* seed({
        taskID: "DA30-008",
        message: assistant({
          taskID: "DA30-008",
          tokens: { input: 7, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
        }),
      })

      const metrics = yield* (yield* TaskMetrics.Service).sprint({
        sprintID: "sprint-3",
        taskIDs: ["DA30-008", "missing", "DA30-008"],
      })

      expect(metrics.taskIDs).toEqual(["DA30-008", "missing"])
      expect(metrics.duplicateTaskIDs).toEqual(["DA30-008"])
      expect(metrics.tasks).toHaveLength(2)
      expect(metrics.tokens.state).toBe("partial")
      expect(metrics.latency.state).toBe("partial")
      expect(metrics.cost.state).toBe("unknown")
      expect("value" in metrics.cost).toBe(false)
    }),
  )

  it.effect("keeps A and B distinct and never invents sprint attention or a measured total from unknown", () =>
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
      const service = yield* TaskMetrics.Service
      const both = yield* service.sprint({ sprintID: "sprint-ab", taskIDs: ["DA30-010-A", "DA30-010-B"] })
      expect(both.taskIDs).toEqual(["DA30-010-A", "DA30-010-B"])
      expect(both.tasks.map((item) => item.taskID)).toEqual(["DA30-010-A", "DA30-010-B"])
      expect(both.tasks[0].tokens).toMatchObject({ state: "measured", value: { input: 10, output: 1 } })
      expect(both.tasks[1].tokens).toMatchObject({ state: "measured", value: { input: 4, output: 2 } })
      expect(both.tokens).toMatchObject({ state: "measured", value: { input: 14, output: 3 } })
      expect(both.cost.state).toBe("unknown")
      expect("value" in both.cost).toBe(false)
      expect(both.freshness.state).toBe("available")
      expect(both.tasks[0].freshness.state).toBe("unknown")
      expect(both.tasks[0].attention.state).toBe("unknown")
      expect(both.tasks[1].attention.state).toBe("unknown")
      expect("attention" in both).toBe(false)

      const partial = yield* service.sprint({ sprintID: "sprint-ab", taskIDs: ["DA30-010-A", "missing-b"] })
      expect(partial.taskIDs).toEqual(["DA30-010-A", "missing-b"])
      expect(partial.tasks[1].taskID).toBe("missing-b")
      expect(partial.tokens.state).not.toBe("measured")
      expect(partial.cost.state).toBe("unknown")
      expect("value" in partial.cost).toBe(false)
    }),
  )

  it.effect("fails closed on a blocked queue without inventing sprint totals", () =>
    Effect.gen(function* () {
      yield* seed({
        taskID: "DA30-010-Q",
        message: assistant({
          taskID: "DA30-010-Q",
          completed: 160,
          tokens: { input: 10, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
        }),
      })
      const service = yield* TaskMetrics.Service
      const error = yield* service
        .sprint({
          sprintID: "sprint-q",
          taskIDs: ["DA30-010-Q", "DA30-010-R"],
          queue: [
            TaskQueue.Entry.make({ id: "DA30-010-Q", mtStatus: "todo", context: "concordant" }),
            TaskQueue.Entry.make({ id: "DA30-010-Q", mtStatus: "todo", context: "concordant" }),
          ],
        })
        .pipe(Effect.flip)
      expect(error).toMatchObject({ _tag: "TaskMetrics.QueueBlocked", reason: "duplicate_task_id" })
    }),
  )
})
