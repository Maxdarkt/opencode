import { describe, expect, test } from "bun:test"
import { ConfigBounds } from "@opencode-ai/core/config/bounds"
import { SessionRunnerBounds } from "@opencode-ai/core/session/runner/bounds"

describe("SessionRunnerBounds", () => {
  test("defaults to 50 steps when agent and config omit a limit", () => {
    expect(SessionRunnerBounds.resolveStepLimit(undefined, undefined)).toBe(ConfigBounds.DEFAULT_STEPS)
    expect(ConfigBounds.DEFAULT_STEPS).toBe(50)
  })

  test("uses the smaller of agent steps and the configured default", () => {
    expect(SessionRunnerBounds.resolveStepLimit(1, 50)).toBe(1)
    expect(SessionRunnerBounds.resolveStepLimit(80, 50)).toBe(50)
    expect(SessionRunnerBounds.resolveStepLimit(undefined, 2)).toBe(2)
  })

  test("sums burned tokens without cache reads", () => {
    expect(SessionRunnerBounds.burnedTokens({ input: 8, output: 3, reasoning: 1 })).toBe(12)
  })

  test("skips the budget axis until usage is known and a limit exists", () => {
    expect(SessionRunnerBounds.budgetExceeded(false, 0, 10)).toBe(false)
    expect(SessionRunnerBounds.budgetExceeded(true, 9, 10)).toBe(false)
    expect(SessionRunnerBounds.budgetExceeded(true, 10, 10)).toBe(true)
    expect(SessionRunnerBounds.budgetExceeded(true, 10, undefined)).toBe(false)
    expect(SessionRunnerBounds.resolveTokenLimit(undefined, undefined)).toBeUndefined()
    expect(SessionRunnerBounds.resolveTokenLimit(undefined, 0)).toBeUndefined()
    expect(SessionRunnerBounds.resolveTokenLimit(100, 4000)).toBe(100)
    expect(SessionRunnerBounds.resolveTokenLimit(undefined, 4000)).toBe(4000)
  })

  test("defaults drain duration to 30 minutes", () => {
    expect(SessionRunnerBounds.resolveDurationMs(undefined)).toBe(ConfigBounds.DEFAULT_DURATION_MS)
    expect(ConfigBounds.DEFAULT_DURATION_MS).toBe(1_800_000)
    expect(SessionRunnerBounds.resolveDurationMs(50)).toBe(50)
  })
})
