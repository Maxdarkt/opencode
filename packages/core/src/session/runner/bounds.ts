export * as SessionRunnerBounds from "./bounds"

import { ConfigBounds } from "../../config/bounds"

export const resolveStepLimit = (agentSteps: number | undefined, configSteps: number | undefined) => {
  const fallback = configSteps ?? ConfigBounds.DEFAULT_STEPS
  return agentSteps !== undefined ? Math.min(agentSteps, fallback) : fallback
}

export const resolveTokenLimit = (configTokens: number | undefined, modelContext: number | undefined) => {
  const limit = configTokens ?? modelContext
  if (limit === undefined || limit <= 0) return
  return limit
}

export const resolveDurationMs = (configDurationMs: number | undefined) =>
  configDurationMs ?? ConfigBounds.DEFAULT_DURATION_MS

export const burnedTokens = (tokens: {
  readonly input: number
  readonly output: number
  readonly reasoning: number
}) => tokens.input + tokens.output + tokens.reasoning

export const budgetExceeded = (known: boolean, burned: number, limit: number | undefined) =>
  known && limit !== undefined && burned >= limit
