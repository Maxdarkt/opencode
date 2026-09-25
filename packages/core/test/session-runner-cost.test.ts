import { describe, expect, test } from "bun:test"
import { SessionRunnerCost } from "@opencode-ai/core/session/runner/cost"

const tokens = {
  input: 1_000_000,
  output: 500_000,
  reasoning: 500_000,
  cache: { read: 0, write: 0 },
}

describe("SessionRunnerCost", () => {
  test("omits a cost when no tariff is configured", () => {
    expect(SessionRunnerCost.estimate(undefined, tokens)).toBeUndefined()
  })

  test("estimates from a single tariff and bills reasoning as output", () => {
    expect(
      SessionRunnerCost.estimate({ input: 3, output: 15, cache: { read: 1, write: 2 } }, tokens),
    ).toEqual({ cost: 18, costState: "estimated" })
  })

  test("omits a zero estimate", () => {
    expect(
      SessionRunnerCost.estimate(
        { input: 0, output: 0, cache: { read: 0, write: 0 } },
        tokens,
      ),
    ).toBeUndefined()
  })

  test("omits an estimate when cache tokens have no rate", () => {
    expect(
      SessionRunnerCost.estimate(
        { input: 3, output: 15 },
        { ...tokens, cache: { read: 10, write: 0 } },
      ),
    ).toBeUndefined()
  })

  test("omits an estimate when several tiers are present", () => {
    expect(
      SessionRunnerCost.estimate(
        [
          { input: 1, output: 2 },
          { input: 3, output: 4 },
        ],
        tokens,
      ),
    ).toBeUndefined()
  })
})
