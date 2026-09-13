export * as TaskChat from "./task-chat"

import { Schema } from "effect"
import { AbsolutePath } from "./schema"
import { Session } from "./session"
import { TaskBinding } from "./task-binding"

const NonEmptyString = Schema.String.check(Schema.isNonEmpty())

export interface OpenInput extends Schema.Schema.Type<typeof OpenInput> {}
export const OpenInput = Schema.Struct({
  mtTaskID: NonEmptyString,
  apexExternalRef: NonEmptyString,
  worktree: AbsolutePath,
}).annotate({ identifier: "TaskChat.OpenInput" })

export interface OpenResult extends Schema.Schema.Type<typeof OpenResult> {}
export const OpenResult = Schema.Struct({
  sessionID: Session.ID,
  created: Schema.Boolean,
  binding: TaskBinding.Info,
}).annotate({ identifier: "TaskChat.OpenResult" })

export class WorktreeMissing extends Schema.TaggedErrorClass<WorktreeMissing>()(
  "TaskChat.WorktreeMissing",
  { worktree: AbsolutePath },
  { httpApiStatus: 404 },
) {}

export class WorktreeNotCheckout extends Schema.TaggedErrorClass<WorktreeNotCheckout>()(
  "TaskChat.WorktreeNotCheckout",
  { worktree: AbsolutePath },
  { httpApiStatus: 400 },
) {}

export class WorktreeConvention extends Schema.TaggedErrorClass<WorktreeConvention>()(
  "TaskChat.WorktreeConvention",
  {
    worktree: AbsolutePath,
    mtTaskID: NonEmptyString,
  },
  { httpApiStatus: 400 },
) {}

export class InspectFailed extends Schema.TaggedErrorClass<InspectFailed>()(
  "TaskChat.InspectFailed",
  { worktree: AbsolutePath },
  { httpApiStatus: 400 },
) {}

export class ConflictError extends Schema.TaggedErrorClass<ConflictError>()(
  "TaskBinding.ConflictError",
  {
    fields: Schema.Array(TaskBinding.Field),
    expected: TaskBinding.Identity,
    observed: Schema.Array(TaskBinding.Identity),
  },
  { httpApiStatus: 409 },
) {}

export class SessionNotFoundError extends Schema.TaggedErrorClass<SessionNotFoundError>()(
  "TaskBinding.SessionNotFoundError",
  { sessionID: Session.ID },
  { httpApiStatus: 404 },
) {}
