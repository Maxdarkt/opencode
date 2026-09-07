export * as TaskMetrics from "./task-metrics"

import { Schema } from "effect"
import { Model } from "./model"
import { optional } from "./schema"

const Provenance = Schema.Array(Schema.String)

export const TokenValue = Schema.Struct({
  input: Schema.Finite,
  output: Schema.Finite,
  reasoning: Schema.Finite,
  cache: Schema.Struct({ read: Schema.Finite, write: Schema.Finite }),
}).annotate({ identifier: "TaskMetrics.TokenValue" })
export interface TokenValue extends Schema.Schema.Type<typeof TokenValue> {}

export const Numeric = Schema.Union([
  Schema.Struct({ state: Schema.Literal("measured"), value: Schema.Finite, provenance: Provenance }),
  Schema.Struct({ state: Schema.Literal("estimated"), value: Schema.Finite, provenance: Provenance }),
  Schema.Struct({ state: Schema.Literal("partial"), value: Schema.Finite.pipe(optional), provenance: Provenance }),
  Schema.Struct({ state: Schema.Literal("unknown"), provenance: Provenance }),
])
  .pipe(Schema.toTaggedUnion("state"))
  .annotate({ identifier: "TaskMetrics.Numeric" })
export type Numeric = typeof Numeric.Type

export const Tokens = Schema.Union([
  Schema.Struct({ state: Schema.Literal("measured"), value: TokenValue, provenance: Provenance }),
  Schema.Struct({ state: Schema.Literal("estimated"), value: TokenValue, provenance: Provenance }),
  Schema.Struct({ state: Schema.Literal("partial"), value: TokenValue.pipe(optional), provenance: Provenance }),
  Schema.Struct({ state: Schema.Literal("unknown"), provenance: Provenance }),
])
  .pipe(Schema.toTaggedUnion("state"))
  .annotate({ identifier: "TaskMetrics.Tokens" })
export type Tokens = typeof Tokens.Type

export const Models = Schema.Union([
  Schema.Struct({ state: Schema.Literal("measured"), value: Schema.Array(Model.Ref), provenance: Provenance }),
  Schema.Struct({ state: Schema.Literal("estimated"), value: Schema.Array(Model.Ref), provenance: Provenance }),
  Schema.Struct({
    state: Schema.Literal("partial"),
    value: Schema.Array(Model.Ref).pipe(optional),
    provenance: Provenance,
  }),
  Schema.Struct({ state: Schema.Literal("unknown"), provenance: Provenance }),
])
  .pipe(Schema.toTaggedUnion("state"))
  .annotate({ identifier: "TaskMetrics.Models" })
export type Models = typeof Models.Type

export const Task = Schema.Struct({
  taskID: Schema.String,
  sessionID: Schema.String.pipe(optional),
  models: Models,
  tokens: Tokens,
  cost: Numeric,
  latency: Numeric,
}).annotate({ identifier: "TaskMetrics.Task" })
export interface Task extends Schema.Schema.Type<typeof Task> {}

export const Sprint = Schema.Struct({
  sprintID: Schema.String,
  taskIDs: Schema.Array(Schema.String),
  duplicateTaskIDs: Schema.Array(Schema.String),
  tasks: Schema.Array(Task),
  models: Models,
  tokens: Tokens,
  cost: Numeric,
  latency: Numeric,
}).annotate({ identifier: "TaskMetrics.Sprint" })
export interface Sprint extends Schema.Schema.Type<typeof Sprint> {}

export const Request = Schema.Union([
  Schema.Struct({ type: Schema.Literal("task"), taskID: Schema.String }),
  Schema.Struct({ type: Schema.Literal("sprint"), sprintID: Schema.String, taskIDs: Schema.Array(Schema.String) }),
])
  .pipe(Schema.toTaggedUnion("type"))
  .annotate({ identifier: "TaskMetrics.Request" })
export type Request = typeof Request.Type

export const Response = Schema.Union([
  Schema.Struct({ type: Schema.Literal("task"), metrics: Task }),
  Schema.Struct({ type: Schema.Literal("sprint"), metrics: Sprint }),
])
  .pipe(Schema.toTaggedUnion("type"))
  .annotate({ identifier: "TaskMetrics.Response" })
export type Response = typeof Response.Type
