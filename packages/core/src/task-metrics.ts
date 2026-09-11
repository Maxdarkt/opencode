export * as TaskMetrics from "./task-metrics"

import { TaskMetrics } from "@opencode-ai/schema/task-metrics"
import { Model } from "@opencode-ai/schema/model"
import { TaskOwnership } from "@opencode-ai/schema/task-ownership"
import { and, asc, eq } from "drizzle-orm"
import { Context, DateTime, Effect, Exit, Layer, Schema } from "effect"
import { Database } from "./database/database"
import { makeGlobalNode } from "./effect/app-node"
import { SessionMessage } from "./session/message"
import { SessionMessageTable, SessionTable } from "./session/sql"
import { TaskBindingTable } from "./task-binding/sql"
import { TaskQueue } from "./task-queue"

export const Request = TaskMetrics.Request
export type Request = TaskMetrics.Request

export class QueueBlockedError extends Schema.TaggedErrorClass<QueueBlockedError>()(
  "TaskMetrics.QueueBlocked",
  {
    reason: TaskQueue.BlockReason,
  },
  { httpApiStatus: 409 },
) {}

const unknownNumeric = (provenance: string[]) => TaskMetrics.Numeric.make({ state: "unknown", provenance })

const partialNumeric = (value: number | undefined, provenance: string[]) =>
  value === undefined
    ? TaskMetrics.Numeric.make({ state: "partial", provenance })
    : TaskMetrics.Numeric.make({ state: "partial", value, provenance })

const unknownTokens = (provenance: string[]) => TaskMetrics.Tokens.make({ state: "unknown", provenance })

const partialTokens = (value: TaskMetrics.TokenValue | undefined, provenance: string[]) =>
  value === undefined
    ? TaskMetrics.Tokens.make({ state: "partial", provenance })
    : TaskMetrics.Tokens.make({ state: "partial", value, provenance })

const unknownModels = (provenance: string[]) => TaskMetrics.Models.make({ state: "unknown", provenance })

const partialModels = (value: Model.Ref[] | undefined, provenance: string[]) =>
  value === undefined
    ? TaskMetrics.Models.make({ state: "partial", provenance })
    : TaskMetrics.Models.make({ state: "partial", value, provenance })

const sumTokens = (values: TaskMetrics.TokenValue[]) =>
  values.reduce(
    (total, value) => ({
      input: total.input + value.input,
      output: total.output + value.output,
      reasoning: total.reasoning + value.reasoning,
      cache: { read: total.cache.read + value.cache.read, write: total.cache.write + value.cache.write },
    }),
    { input: 0, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
  )

const numeric = (values: number[], expected: number, incomplete: boolean, provenance: string[]) => {
  if (expected === 0 && !incomplete) return unknownNumeric(provenance)
  const value = values.length ? values.reduce((total, item) => total + item, 0) : undefined
  if (values.length === expected && !incomplete)
    return TaskMetrics.Numeric.make({ state: "measured", value: value ?? 0, provenance })
  return partialNumeric(value, provenance)
}

const tokens = (values: TaskMetrics.TokenValue[], expected: number, incomplete: boolean, provenance: string[]) => {
  if (expected === 0 && !incomplete) return unknownTokens(provenance)
  const value = values.length ? TaskMetrics.TokenValue.make(sumTokens(values)) : undefined
  if (values.length === expected && !incomplete && value)
    return TaskMetrics.Tokens.make({ state: "measured", value, provenance })
  return partialTokens(value, provenance)
}

const models = (values: Model.Ref[] | undefined, incomplete: boolean, provenance: string[]) => {
  if (!values?.length && !incomplete) return unknownModels(provenance)
  if (!incomplete) return TaskMetrics.Models.make({ state: "measured", value: values ?? [], provenance })
  return partialModels(values, provenance)
}

const combineNumeric = (values: TaskMetrics.Numeric[], provenance: string[]) => {
  if (!values.length) return unknownNumeric(provenance)
  const known = values.flatMap((value) => {
    if (value.state === "unknown" || value.value === undefined) return []
    return [value.value]
  })
  const states = new Set(values.map((value) => value.state))
  const complete = states.size === 1 && !states.has("partial") && !states.has("unknown")
  if (!known.length && states.size === 1 && states.has("unknown")) return unknownNumeric(provenance)
  const total = known.reduce((sum, value) => sum + value, 0)
  if (complete && states.has("measured"))
    return TaskMetrics.Numeric.make({ state: "measured", value: total, provenance })
  if (complete && states.has("estimated"))
    return TaskMetrics.Numeric.make({ state: "estimated", value: total, provenance })
  return partialNumeric(known.length ? total : undefined, provenance)
}

const combineTokens = (values: TaskMetrics.Tokens[], provenance: string[]) => {
  if (!values.length) return unknownTokens(provenance)
  const known = values.flatMap((value) => {
    if (value.state === "unknown" || value.value === undefined) return []
    return [value.value]
  })
  const states = new Set(values.map((value) => value.state))
  const complete = states.size === 1 && !states.has("partial") && !states.has("unknown")
  if (!known.length && states.size === 1 && states.has("unknown")) return unknownTokens(provenance)
  const total = TaskMetrics.TokenValue.make(sumTokens(known))
  if (complete && states.has("measured"))
    return TaskMetrics.Tokens.make({ state: "measured", value: total, provenance })
  if (complete && states.has("estimated"))
    return TaskMetrics.Tokens.make({ state: "estimated", value: total, provenance })
  return partialTokens(known.length ? total : undefined, provenance)
}

const combineModels = (values: TaskMetrics.Models[], provenance: string[]) => {
  if (!values.length) return unknownModels(provenance)
  const known = values.flatMap((value) => {
    if (value.state === "unknown" || value.value === undefined) return []
    return value.value
  })
  const unique = Array.from(new Map(known.map((value) => [`${value.providerID}/${value.id}`, value])).values())
  const states = new Set(values.map((value) => value.state))
  const complete = states.size === 1 && !states.has("partial") && !states.has("unknown")
  if (!unique.length && states.size === 1 && states.has("unknown")) return unknownModels(provenance)
  if (complete && states.has("measured"))
    return TaskMetrics.Models.make({ state: "measured", value: unique, provenance })
  if (complete && states.has("estimated"))
    return TaskMetrics.Models.make({ state: "estimated", value: unique, provenance })
  return partialModels(unique.length ? unique : undefined, provenance)
}

const unknownFreshness = () => TaskMetrics.Freshness.make({ state: "unknown" })

const unknownAttention = (taskID: string) =>
  TaskOwnership.AttentionFact.make({
    state: "unknown",
    provenance: TaskOwnership.Provenance.make({ source: "attention_input", reference: taskID }),
    freshness: TaskOwnership.Freshness.make({}),
  })

const bindingSources = (taskID: string) => [
  TaskOwnership.Provenance.make({ source: "task_binding", reference: taskID }),
]

const unknownCost = (provenance: string[]) =>
  unknownNumeric([...provenance, "no durable billing or tariff provenance"])

export interface Interface {
  readonly task: (input: { taskID: string }) => Effect.Effect<TaskMetrics.Task>
  readonly sprint: (input: {
    sprintID: string
    taskIDs: string[]
    queue?: ReadonlyArray<TaskQueue.Entry>
  }) => Effect.Effect<TaskMetrics.Sprint, QueueBlockedError>
}

export class Service extends Context.Service<Service, Interface>()("@opencode/TaskMetrics") {}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const { db } = yield* Database.Service
    const decode = Schema.decodeUnknownEffect(SessionMessage.Message)

    const task = Effect.fn("TaskMetrics.task")(function* (input: { taskID: string }) {
      const binding = yield* db
        .select()
        .from(TaskBindingTable)
        .where(eq(TaskBindingTable.mt_task_id, input.taskID))
        .get()
        .pipe(Effect.orDie)
      const bindingProvenance = [`task_binding:${input.taskID}`]
      if (!binding)
        return TaskMetrics.Task.make({
          taskID: input.taskID,
          models: unknownModels([...bindingProvenance, "task binding not found"]),
          tokens: unknownTokens([...bindingProvenance, "task binding not found"]),
          cost: unknownCost([...bindingProvenance, "task binding not found"]),
          latency: unknownNumeric([...bindingProvenance, "task binding not found"]),
          freshness: unknownFreshness(),
          attention: unknownAttention(input.taskID),
          sources: bindingSources(input.taskID),
        })
      const session = yield* db
        .select({ id: SessionTable.id })
        .from(SessionTable)
        .where(eq(SessionTable.id, binding.session_id))
        .get()
        .pipe(Effect.orDie)
      if (!session)
        return TaskMetrics.Task.make({
          taskID: input.taskID,
          sessionID: binding.session_id,
          models: unknownModels([...bindingProvenance, "bound session not found"]),
          tokens: unknownTokens([...bindingProvenance, "bound session not found"]),
          cost: unknownCost([...bindingProvenance, "bound session not found"]),
          latency: unknownNumeric([...bindingProvenance, "bound session not found"]),
          freshness: unknownFreshness(),
          attention: unknownAttention(input.taskID),
          sources: bindingSources(input.taskID),
        })
      const rows = yield* db
        .select()
        .from(SessionMessageTable)
        .where(and(eq(SessionMessageTable.session_id, session.id), eq(SessionMessageTable.type, "assistant")))
        .orderBy(asc(SessionMessageTable.seq))
        .all()
        .pipe(Effect.orDie)
      const decoded = yield* Effect.forEach(rows, (row) =>
        decode({ ...row.data, id: row.id, type: row.type }).pipe(Effect.exit),
      )
      const assistants = decoded.flatMap((value) =>
        Exit.isSuccess(value) && value.value.type === "assistant" ? [value.value] : [],
      )
      const incomplete =
        decoded.some(Exit.isFailure) || assistants.some((assistant) => assistant.time.completed === undefined)
      const provenance = [...bindingProvenance, ...assistants.map((assistant) => `session_message:${assistant.id}`)]
      const modelValues = Array.from(
        new Map(
          assistants.map((assistant) => [`${assistant.model.providerID}/${assistant.model.id}`, assistant.model]),
        ).values(),
      )
      const tokenValues = assistants.flatMap((assistant) => (assistant.tokens ? [assistant.tokens] : []))
      const latencyValues = assistants.flatMap((assistant) =>
        assistant.time.completed === undefined
          ? []
          : [
              Math.max(
                0,
                DateTime.toEpochMillis(assistant.time.completed) - DateTime.toEpochMillis(assistant.time.created),
              ),
            ],
      )
      return TaskMetrics.Task.make({
        taskID: input.taskID,
        sessionID: session.id,
        models: models(modelValues, decoded.some(Exit.isFailure), provenance),
        tokens: tokens(tokenValues, assistants.length, incomplete, provenance),
        cost: unknownCost(provenance),
        latency: numeric(latencyValues, assistants.length, incomplete, provenance),
        freshness: unknownFreshness(),
        attention: unknownAttention(input.taskID),
        sources: bindingSources(input.taskID),
      })
    })

    return Service.of({
      task,
      sprint: Effect.fn("TaskMetrics.sprint")(function* (input) {
        if (input.queue) {
          const result = TaskQueue.evaluate(input.queue)
          if (result.kind === "blocked") return yield* new QueueBlockedError({ reason: result.reason })
        }
        const taskIDs = Array.from(new Set(input.taskIDs))
        const duplicateTaskIDs = Array.from(
          new Set(input.taskIDs.filter((taskID, index) => input.taskIDs.indexOf(taskID) !== index)),
        )
        const tasks = yield* Effect.forEach(taskIDs, (taskID) => task({ taskID }))
        const provenance = [`sprint:${input.sprintID}`, ...tasks.flatMap((item) => item.tokens.provenance)]
        const observedAt = yield* DateTime.nowAsDate.pipe(Effect.map((date) => date.toISOString()))
        return TaskMetrics.Sprint.make({
          sprintID: input.sprintID,
          taskIDs,
          duplicateTaskIDs,
          tasks,
          models: combineModels(
            tasks.map((item) => item.models),
            provenance,
          ),
          tokens: combineTokens(
            tasks.map((item) => item.tokens),
            provenance,
          ),
          cost: combineNumeric(
            tasks.map((item) => item.cost),
            provenance,
          ),
          latency: combineNumeric(
            tasks.map((item) => item.latency),
            provenance,
          ),
          freshness: TaskMetrics.Freshness.make({
            state: "available",
            value: TaskOwnership.Freshness.make({ observedAt }),
          }),
          sources: Array.from(
            new Map(tasks.flatMap((item) => item.sources).map((source) => [source.reference, source])).values(),
          ),
        })
      }),
    })
  }),
)

export const node = makeGlobalNode({ service: Service, layer, deps: [Database.node] })
