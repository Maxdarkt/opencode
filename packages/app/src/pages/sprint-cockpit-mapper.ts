import type {
  RepositoryTopologyCountFact,
  RepositoryTopologySnapshot,
  RepositoryTopologyStringFact,
  RepositoryTopologyWorktree,
  TaskMetricsResponse,
  TaskOwnershipAttentionFact,
  TaskOwnershipAuthorityFact,
  TaskOwnershipBindingFact,
  TaskOwnershipEntry,
  TaskOwnershipExecutionFact,
  TaskOwnershipSnapshot,
} from "@opencode-ai/sdk/v2/client"
import { sprintCockpitInput } from "./sprint-cockpit-input"

export type DisplayFact = {
  readonly text: string
  readonly state: string
  readonly source: string
}

export type CockpitTaskView = {
  readonly id: string
  readonly title: string
  readonly status: DisplayFact
  readonly sessionHref: string | null
  readonly isWorking: boolean
  readonly hasUnread: boolean
  readonly worktree: DisplayFact
  readonly branch: DisplayFact
  readonly head: DisplayFact
  readonly chatPreview: DisplayFact
}

export type CockpitWorktreeView = {
  readonly path: DisplayFact
  readonly branch: DisplayFact
  readonly mergeTarget: DisplayFact
  readonly cleanliness: DisplayFact
  readonly ahead: DisplayFact
  readonly behind: DisplayFact
  readonly additions: DisplayFact
  readonly deletions: DisplayFact
  readonly modifiedFiles: DisplayFact
  readonly taskID: DisplayFact
}

export type CockpitView = {
  readonly source: "live" | "inaccessible"
  readonly tasks: readonly CockpitTaskView[]
  readonly worktrees: readonly CockpitWorktreeView[]
  readonly sourceRepo: DisplayFact
  readonly metricsCost: DisplayFact
}

type StringishFact = {
  readonly state: string
  readonly value?: unknown
  readonly provenance?: { readonly source?: string }
}

export function formatFact(fact: StringishFact | undefined, asText: (value: unknown) => string = String): DisplayFact {
  if (!fact) return { text: "unknown", state: "unknown", source: "missing" }
  if (fact.state === "available") {
    return { text: asText(fact.value), state: "available", source: fact.provenance?.source ?? "available" }
  }
  return {
    text: `${fact.state} (${fact.provenance?.source ?? "unknown"})`,
    state: fact.state,
    source: fact.provenance?.source ?? "unknown",
  }
}

const sessionFromBinding = (binding: TaskOwnershipBindingFact) => {
  if (binding.state !== "available") return null
  return binding.value.sessionID
}

const sessionFromExecution = (execution: TaskOwnershipExecutionFact) => {
  if (execution.state !== "available") return null
  return execution.value.sessionID
}

const workingFrom = (authority: TaskOwnershipAuthorityFact, execution: TaskOwnershipExecutionFact) => {
  if (authority.state === "available" && authority.value.mtStatus === "in_progress") return true
  if (execution.state === "available") return execution.value.effects.some((effect) => effect.state === "pending")
  return false
}

const unreadFrom = (attention: TaskOwnershipAttentionFact) => {
  if (attention.state !== "available") return false
  return attention.value.length > 0
}

const statusFrom = (authority: TaskOwnershipAuthorityFact): DisplayFact => {
  if (authority.state === "available" && authority.value.mtStatus) {
    return { text: authority.value.mtStatus, state: "available", source: authority.provenance.source }
  }
  return formatFact(authority)
}

const mapEntry = (entry: TaskOwnershipEntry): CockpitTaskView => {
  const sessionID = sessionFromBinding(entry.binding) ?? sessionFromExecution(entry.execution)
  return {
    id: entry.identity.mtTaskID,
    title: entry.identity.mtTaskID,
    status: statusFrom(entry.authority),
    sessionHref: sessionID ? `/session/${sessionID}` : null,
    isWorking: workingFrom(entry.authority, entry.execution),
    hasUnread: unreadFrom(entry.attention),
    worktree: formatFact(entry.binding.state === "available" ? { state: "available", value: entry.binding.value.checkout.worktree, provenance: entry.binding.provenance } : entry.binding),
    branch: formatFact(entry.binding.state === "available" ? { state: "available", value: entry.binding.value.checkout.branch, provenance: entry.binding.provenance } : entry.binding),
    head: formatFact(entry.binding.state === "available" ? { state: "available", value: entry.binding.value.checkout.head, provenance: entry.binding.provenance } : entry.binding),
    chatPreview: sessionID
      ? { text: sessionID, state: "available", source: "task_binding" }
      : { text: "unknown (session)", state: "unknown", source: "session" },
  }
}

const countFact = (fact: RepositoryTopologyCountFact) => formatFact(fact, (value) => String(value))

const mapWorktree = (worktree: RepositoryTopologyWorktree): CockpitWorktreeView => ({
  path: formatFact(worktree.path as RepositoryTopologyStringFact),
  branch: formatFact(worktree.branch as RepositoryTopologyStringFact),
  mergeTarget: formatFact(worktree.mergeTarget as RepositoryTopologyStringFact),
  cleanliness: formatFact(worktree.cleanliness),
  ahead: countFact(worktree.ahead),
  behind: countFact(worktree.behind),
  additions: formatFact(worktree.workingTreeDiff, (value) => String((value as { additions: number }).additions)),
  deletions: formatFact(worktree.workingTreeDiff, (value) => String((value as { deletions: number }).deletions)),
  modifiedFiles: formatFact(worktree.workingTreeDiff, (value) => String((value as { modifiedFiles: number }).modifiedFiles)),
  taskID: formatFact(worktree.task, (value) => (value as { mtTaskID: string }).mtTaskID),
})

const metricsCost = (metrics: TaskMetricsResponse | undefined): DisplayFact => {
  if (!metrics) return { text: "unknown (metrics)", state: "unknown", source: "metrics" }
  const cost = metrics.metrics.cost
  if (cost.state === "measured" || cost.state === "estimated") {
    return { text: String(cost.value), state: cost.state, source: cost.provenance[0] ?? "metrics" }
  }
  return { text: `${cost.state} (metrics)`, state: cost.state, source: "metrics" }
}

export function mapCockpitView(input: {
  ownership: TaskOwnershipSnapshot
  topology?: RepositoryTopologySnapshot
  metrics?: TaskMetricsResponse
  source?: "live" | "inaccessible"
}): CockpitView {
  return {
    source: input.source ?? "live",
    tasks: input.ownership.entries.map(mapEntry),
    worktrees: (input.topology?.repositories ?? []).flatMap((repo) => repo.worktrees.map(mapWorktree)),
    sourceRepo: formatFact(input.topology?.repositories[0]?.sourceRepo),
    metricsCost: metricsCost(input.metrics),
  }
}

export function inaccessibleCockpitView(): CockpitView {
  return {
    source: "inaccessible",
    tasks: sprintCockpitInput.identities.map((identity) => ({
      id: identity.mtTaskID,
      title: identity.mtTaskID,
      status: { text: "inaccessible (http)", state: "inaccessible", source: "http" },
      sessionHref: null,
      isWorking: false,
      hasUnread: false,
      worktree: { text: "inaccessible (http)", state: "inaccessible", source: "http" },
      branch: { text: "inaccessible (http)", state: "inaccessible", source: "http" },
      head: { text: "inaccessible (http)", state: "inaccessible", source: "http" },
      chatPreview: { text: "unknown (session)", state: "unknown", source: "session" },
    })),
    worktrees: [],
    sourceRepo: { text: "inaccessible (http)", state: "inaccessible", source: "http" },
    metricsCost: { text: "unknown (metrics)", state: "unknown", source: "metrics" },
  }
}
