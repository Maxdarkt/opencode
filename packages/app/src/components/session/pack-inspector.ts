export type MetricState = {
  state: string
  value?: unknown
}

export type PackSnapshot = {
  worktree?: string
  pathset?: ReadonlyArray<string>
  omitted?: ReadonlyArray<{ path: string }>
  mandate?: { system?: string; user?: string }
  tokensBefore?: MetricState
  tokensAfter?: MetricState
}

export type PackInspectorView = {
  worktree: string
  pathset: ReadonlyArray<string>
  omitted: ReadonlyArray<string>
  mandate: string
  tokensBefore: string
  tokensAfter: string
  cost: string
}

// Absent or unpublished metrics stay "unknown". Never render a false zero.
export function formatTokens(metric: MetricState | undefined): string {
  if (!metric || metric.state === "unknown" || metric.value === undefined) return "unknown"
  if (typeof metric.value !== "object" || metric.value === null) return "unknown"
  if (!("input" in metric.value)) return "unknown"
  const tokens = metric.value as {
    input?: number
    output?: number
    reasoning?: number
    cache?: { read?: number; write?: number }
  }
  const total =
    (tokens.input ?? 0) + (tokens.output ?? 0) + (tokens.reasoning ?? 0) + (tokens.cache?.read ?? 0) + (tokens.cache?.write ?? 0)
  return String(total)
}

export function formatCost(metric: MetricState | undefined): string {
  if (!metric || metric.state === "unknown" || typeof metric.value !== "number") return "unknown"
  if (metric.value === 0) return "unknown"
  return String(metric.value)
}

export function packInspectorView(input: { pack?: PackSnapshot; cost?: MetricState }): PackInspectorView {
  return {
    worktree: input.pack?.worktree || "unknown",
    pathset: input.pack?.pathset ?? [],
    omitted: (input.pack?.omitted ?? []).map((item) => item.path),
    mandate: input.pack?.mandate?.user || input.pack?.mandate?.system || "unknown",
    tokensBefore: formatTokens(input.pack?.tokensBefore),
    tokensAfter: formatTokens(input.pack?.tokensAfter),
    cost: formatCost(input.cost),
  }
}
