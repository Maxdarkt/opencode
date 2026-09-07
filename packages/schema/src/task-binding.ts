export * as TaskBinding from "./task-binding"

import { Schema } from "effect"
import { Location } from "./location"
import { Project } from "./project"
import { DateTimeUtcFromMillis, AbsolutePath } from "./schema"
import { Session } from "./session"

const NonEmptyString = Schema.String.check(Schema.isNonEmpty())

export const Version = Schema.Literal(1).annotate({ identifier: "TaskBinding.Version" })
export type Version = typeof Version.Type

export const Field = Schema.Literals([
  "mtTaskID",
  "apexExternalRef",
  "sessionID",
  "projectID",
  "location.directory",
  "location.workspaceID",
  "repository",
  "branch",
  "worktree",
  "head",
]).annotate({ identifier: "TaskBinding.Field" })
export type Field = typeof Field.Type

export interface Checkout extends Schema.Schema.Type<typeof Checkout> {}
export const Checkout = Schema.Struct({
  repository: AbsolutePath,
  branch: NonEmptyString,
  worktree: AbsolutePath,
  head: NonEmptyString,
}).annotate({ identifier: "TaskBinding.Checkout" })

export interface Identity extends Schema.Schema.Type<typeof Identity> {}
export const Identity = Schema.Struct({
  mtTaskID: NonEmptyString,
  apexExternalRef: NonEmptyString,
  sessionID: Session.ID,
  projectID: Project.ID,
  location: Location.Ref,
  checkout: Checkout,
}).annotate({ identifier: "TaskBinding.Identity" })

export interface Info extends Schema.Schema.Type<typeof Info> {}
export const Info = Schema.Struct({
  ...Identity.fields,
  version: Version,
  time: Schema.Struct({
    created: DateTimeUtcFromMillis,
    updated: DateTimeUtcFromMillis,
  }),
}).annotate({ identifier: "TaskBinding.Info" })

export const Ref = Schema.Union([
  Schema.Struct({ type: Schema.Literal("mt_task"), value: NonEmptyString }),
  Schema.Struct({ type: Schema.Literal("apex_external_ref"), value: NonEmptyString }),
  Schema.Struct({ type: Schema.Literal("session"), value: Session.ID }),
]).pipe(Schema.toTaggedUnion("type"))
export type Ref = Schema.Schema.Type<typeof Ref>
