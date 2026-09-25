export type TokenParts = {
  readonly input?: number
  readonly output?: number
  readonly reasoning?: number
  readonly cache?: { readonly read?: number; readonly write?: number }
}

export type MetricFact = {
  readonly state: string
  readonly value?: TokenParts
}

export type StopReason = "interrupt" | "steps" | "budget" | "timeout"

export type BudgetAlertInput = {
  readonly sprintTokens?: number
  readonly used?: MetricFact
  readonly contextTokens?: MetricFact
  readonly contextWindow?: number
  readonly retries?: number
  readonly stopReason?: StopReason
}

export type AlertText = {
  readonly text: string
  readonly provenance: string
}

const unknown = (provenance: string): AlertText => ({ text: "unknown", provenance })

const burned = (value: TokenParts | undefined) => {
  if (!value) return undefined
  return (value.input ?? 0) + (value.output ?? 0) + (value.reasoning ?? 0)
}

const packTotal = (metric: MetricFact | undefined) => {
  if (!metric || metric.state === "unknown" || !metric.value) return undefined
  const value = metric.value
  return (
    (value.input ?? 0) +
    (value.output ?? 0) +
    (value.reasoning ?? 0) +
    (value.cache?.read ?? 0) +
    (value.cache?.write ?? 0)
  )
}

export function sprintBudgetAlert(input: BudgetAlertInput): AlertText {
  if (input.sprintTokens === undefined || input.used?.state !== "measured")
    return unknown("config.bounds.sprint_tokens")
  const used = burned(input.used.value)
  if (used === undefined) return unknown("config.bounds.sprint_tokens")
  if (used >= input.sprintTokens) return { text: "exceeded", provenance: "config.bounds.sprint_tokens" }
  return { text: "within", provenance: "config.bounds.sprint_tokens" }
}

export function contextBudgetAlert(input: BudgetAlertInput): AlertText {
  if (input.contextWindow === undefined) return unknown("model.limit.context")
  const total = packTotal(input.contextTokens)
  if (total === undefined) return unknown("context.pack")
  if (total > input.contextWindow) return { text: "exceeded", provenance: "context.pack" }
  return { text: "within", provenance: "context.pack" }
}

export function retriesAlert(input: BudgetAlertInput): AlertText {
  if (input.retries === undefined) return unknown("session.next.retried")
  return { text: String(input.retries), provenance: "session.next.retried" }
}

export function emptyRunAlert(input: BudgetAlertInput): AlertText {
  if (input.stopReason === "steps" || input.stopReason === "budget" || input.stopReason === "timeout")
    return { text: input.stopReason, provenance: "session.next.drain.ended" }
  return unknown("session.next.drain.ended")
}

export function budgetAlerts(input: BudgetAlertInput) {
  return {
    sprint: sprintBudgetAlert(input),
    context: contextBudgetAlert(input),
    retries: retriesAlert(input),
    emptyRun: emptyRunAlert(input),
  }
}
