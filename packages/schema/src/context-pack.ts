export * as ContextPack from "./context-pack"

import { Schema } from "effect"
import { AbsolutePath, optional, RelativePath } from "./schema"
import { TaskMetrics } from "./task-metrics"

const Provenance = Schema.Array(Schema.String)

export const Mandate = Schema.Struct({
  system: Schema.String.pipe(optional),
  user: Schema.String.pipe(optional),
}).annotate({ identifier: "ContextPack.Mandate" })
export interface Mandate extends Schema.Schema.Type<typeof Mandate> {}

export const Pathset = Schema.Array(RelativePath).annotate({ identifier: "ContextPack.Pathset" })
export type Pathset = typeof Pathset.Type

export const OmittedPath = Schema.Struct({
  path: Schema.String,
  provenance: Provenance,
}).annotate({ identifier: "ContextPack.OmittedPath" })
export interface OmittedPath extends Schema.Schema.Type<typeof OmittedPath> {}

export const CachePrefix = Schema.Struct({
  cwd: AbsolutePath,
  rulesHash: Schema.String,
  toolsIdentity: Schema.String,
}).annotate({ identifier: "ContextPack.CachePrefix" })
export interface CachePrefix extends Schema.Schema.Type<typeof CachePrefix> {}

export const Pack = Schema.Struct({
  mandate: Mandate,
  worktree: AbsolutePath,
  pathset: Pathset,
  omitted: Schema.Array(OmittedPath),
  tokensBefore: TaskMetrics.Tokens,
  tokensAfter: TaskMetrics.Tokens,
  cachePrefix: CachePrefix,
}).annotate({ identifier: "ContextPack" })
export interface Pack extends Schema.Schema.Type<typeof Pack> {}
