export * as ContextPack from "./context-pack"

import { isAbsolute, relative, resolve, sep } from "path"
import { ContextPack } from "@opencode-ai/schema/context-pack"
import { TaskMetrics } from "@opencode-ai/schema/task-metrics"
import { AbsolutePath, RelativePath } from "./schema"
import { Hash } from "./util/hash"
import { Token } from "./util/token"

const TOKEN_PROVENANCE = ["Token.estimate"]

export type Candidate = {
  path: string
  provenance: ReadonlyArray<string>
}

export type Input = {
  mandate: { system?: string; user?: string }
  worktree: string
  paths: ReadonlyArray<Candidate>
  rules: string
  toolsIdentity: string
  requestBefore?: string
  requestAfter?: string
}

export const assemble = (input: Input) => {
  const bounded = boundPathset(input.worktree, input.paths)
  const worktree = AbsolutePath.make(resolve(input.worktree))
  return ContextPack.Pack.make({
    mandate: ContextPack.Mandate.make({
      ...(input.mandate.system === undefined ? {} : { system: input.mandate.system }),
      ...(input.mandate.user === undefined ? {} : { user: input.mandate.user }),
    }),
    worktree,
    pathset: bounded.pathset,
    omitted: bounded.omitted,
    tokensBefore: estimateTokens(input.requestBefore),
    tokensAfter: estimateTokens(input.requestAfter),
    cachePrefix: ContextPack.CachePrefix.make({
      cwd: worktree,
      rulesHash: Hash.sha256(input.rules),
      toolsIdentity: input.toolsIdentity,
    }),
  })
}

export const boundPathset = (worktree: string, paths: ReadonlyArray<Candidate>) => {
  const classified = paths.map((item) => classify(worktree, item))
  const seen = new Set<string>()
  return {
    pathset: classified.flatMap((item) => {
      if (item.kind !== "inside") return []
      if (seen.has(item.path)) return []
      seen.add(item.path)
      return [RelativePath.make(item.path)]
    }),
    omitted: classified.flatMap((item) =>
      item.kind === "outside"
        ? [ContextPack.OmittedPath.make({ path: item.path, provenance: [...item.provenance] })]
        : [],
    ),
  }
}

export const promptCacheKey = (prefix: ContextPack.CachePrefix) =>
  Hash.sha256([prefix.cwd, prefix.rulesHash, prefix.toolsIdentity].join("\n"))

function classify(worktree: string, item: Candidate) {
  const root = resolve(worktree)
  const resolved = isAbsolute(item.path) ? resolve(item.path) : resolve(root, item.path)
  const rel = relative(root, resolved)
  if (rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel))) {
    if (rel === "") return { kind: "root" as const }
    return { kind: "inside" as const, path: rel }
  }
  return { kind: "outside" as const, path: item.path, provenance: item.provenance }
}

function estimateTokens(input: string | undefined) {
  if (input === undefined) return TaskMetrics.Tokens.make({ state: "unknown", provenance: TOKEN_PROVENANCE })
  return TaskMetrics.Tokens.make({
    state: "estimated",
    value: TaskMetrics.TokenValue.make({
      input: Token.estimate(input),
      output: 0,
      reasoning: 0,
      cache: { read: 0, write: 0 },
    }),
    provenance: TOKEN_PROVENANCE,
  })
}
