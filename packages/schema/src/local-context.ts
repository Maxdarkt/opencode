import { Schema } from "effect"

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
}).annotate({ identifier: "LocalContext.Info" })
export interface Info extends Schema.Schema.Type<typeof Info> {}

export * as LocalContext from "./local-context"
