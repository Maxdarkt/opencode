import { Schema } from "effect"
import { TaskAuthority } from "./task-authority"

const TaskContext = Schema.Struct({
  binding: Schema.Struct({
    mtTaskID: Schema.String,
    apexExternalRef: Schema.String,
    sessionID: Schema.String,
    projectID: Schema.String,
    location: Schema.Struct({ directory: Schema.String, workspaceID: Schema.optional(Schema.NullOr(Schema.String)) }),
    checkout: Schema.Struct({
      repository: Schema.String,
      branch: Schema.String,
      worktree: Schema.String,
      head: Schema.String,
    }),
    version: Schema.Literal(1),
  }),
  execution: Schema.NullOr(
    Schema.Struct({
      mtTaskID: Schema.String,
      sessionID: Schema.String,
      worktree: Schema.String,
      ownerID: Schema.String,
      generation: Schema.Finite,
      effects: Schema.Array(
        Schema.Struct({ effectID: Schema.String, state: Schema.Literals(["pending", "confirmed"]) }),
      ),
    }),
  ),
  authority: Schema.optional(Schema.NullOr(TaskAuthority.Observation)),
})

export const Info = Schema.Struct({
  requested_directory: Schema.String,
  canonical_directory: Schema.NullOr(Schema.String),
  availability: Schema.Literals(["available", "absent", "inaccessible", "not_directory", "invalid"]),
  session_directory: Schema.NullOr(Schema.String),
  session_canonical_directory: Schema.NullOr(Schema.String),
  session_status: Schema.Literals(["not_requested", "found", "missing", "unavailable", "workspace"]),
  concordance: Schema.Literals(["not_applicable", "matches", "mismatch", "unknown"]),
  git: Schema.NullOr(
    Schema.Struct({
      status: Schema.Literals(["available", "non_git", "unavailable"]),
      top_level: Schema.NullOr(Schema.String),
      git_directory: Schema.NullOr(Schema.String),
      common_directory: Schema.NullOr(Schema.String),
      branch: Schema.NullOr(Schema.String),
      head: Schema.NullOr(Schema.String),
      head_status: Schema.Literals(["branch", "detached", "unborn", "unknown"]),
      base_ref: Schema.NullOr(Schema.String),
      base_oid: Schema.NullOr(Schema.String),
      base_status: Schema.Literals(["not_requested", "resolved", "unresolved"]),
      dirty: Schema.NullOr(Schema.Boolean),
      conflicts: Schema.NullOr(Schema.Boolean),
      review: Schema.Literals(["clean", "changed", "conflicts", "incomplete"]),
    }),
  ),
  task: Schema.optional(Schema.NullOr(TaskContext)),
}).annotate({ identifier: "LocalContext.Info" })
export interface Info extends Schema.Schema.Type<typeof Info> {}

export * as LocalContext from "./local-context"
