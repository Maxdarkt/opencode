import { cockpitPromptText } from "@/pages/sprint-cockpit-prompt"
import { budgetAlerts, type BudgetAlertInput } from "./budget-alert"

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
  budgetAlert: string
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
  return `${metric.state} ${String(metric.value)}`
}

export function formatBudgetAlert(input: BudgetAlertInput = {}): string {
  const alerts = budgetAlerts(input)
  return `sprint ${alerts.sprint.text} · context ${alerts.context.text} · retries ${alerts.retries.text} · empty ${alerts.emptyRun.text}`
}

export function packInspectorView(input: { pack?: PackSnapshot; cost?: MetricState; alert?: BudgetAlertInput }): PackInspectorView {
  return {
    worktree: input.pack?.worktree || "unknown",
    pathset: input.pack?.pathset ?? [],
    omitted: (input.pack?.omitted ?? []).map((item) => item.path),
    mandate: input.pack?.mandate?.user || input.pack?.mandate?.system || "unknown",
    tokensBefore: formatTokens(input.pack?.tokensBefore),
    tokensAfter: formatTokens(input.pack?.tokensAfter),
    cost: formatCost(input.cost),
    budgetAlert: formatBudgetAlert(input.alert),
  }
}

export type PackInspectorTab = "task" | "git" | "context" | "cost" | "servers" | "permissions"

export const PACK_INSPECTOR_TABS: readonly PackInspectorTab[] = [
  "task",
  "git",
  "context",
  "cost",
  "servers",
  "permissions",
]

export type PackInspectorGitView = {
  branch: string
  head: string
  dirty: string
  review: string
}

export type PackInspectorTaskView = {
  id: string
  status: string
  worktree: string
  branch: string
  head: string
  prompt: string | null
}

type GitSnapshot = {
  status: string
  branch: string | null
  head: string | null
  dirty: boolean | null
  review: string
} | null

export function packInspectorGitView(git: GitSnapshot | undefined): PackInspectorGitView {
  if (!git || git.status !== "available") {
    return { branch: "unknown", head: "unknown", dirty: "unknown", review: "unknown" }
  }
  return {
    branch: git.branch || "unknown",
    head: git.head || "unknown",
    dirty: git.dirty === null ? "unknown" : git.dirty ? "dirty" : "clean",
    review: git.review || "unknown",
  }
}

export function packInspectorTaskView(input: {
  currentSessionID: string | undefined
  tasks: ReadonlyArray<{
    id: string
    sessionHref: string | null
    status: { text: string }
    worktreeLabel: { text: string; state: string }
    branch: { text: string }
    head: { text: string; state: string }
  }>
}): PackInspectorTaskView {
  const unknown = {
    id: "unknown",
    status: "unknown",
    worktree: "unknown",
    branch: "unknown",
    head: "unknown",
    prompt: null,
  }
  if (!input.currentSessionID) return unknown
  const task = input.tasks.find((item) => {
    if (!item.sessionHref) return false
    const match = item.sessionHref.match(/\/session\/([^/?#]+)/)
    return match?.[1] === input.currentSessionID
  })
  if (!task) return unknown
  return {
    id: task.id,
    status: task.status.text,
    worktree: task.worktreeLabel.text,
    branch: task.branch.text,
    head: task.head.text,
    prompt: cockpitPromptText({
      id: task.id,
      worktreeLabel: task.worktreeLabel,
      head: task.head,
    }),
  }
}

export function packInspectorUnknownBody() {
  return "unknown"
}

export function packInspectorMergeAction() {
  return { type: "simulated" as const }
}
