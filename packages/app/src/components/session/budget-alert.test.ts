import { describe, expect, test } from "bun:test"
import { budgetAlerts } from "./budget-alert"

const measured = {
  state: "measured",
  value: { input: 8, output: 3, reasoning: 1, cache: { read: 4, write: 0 } },
}

describe("budgetAlerts", () => {
  test("stays unknown without a ceiling or a measurement", () => {
    const alerts = budgetAlerts({})
    expect(alerts.sprint.text).toBe("unknown")
    expect(alerts.context.text).toBe("unknown")
    expect(alerts.retries.text).toBe("unknown")
    expect(alerts.emptyRun.text).toBe("unknown")
    expect(alerts.sprint.text).not.toBe("0")
  })

  test("compares measured tokens to the sprint ceiling without cache reads", () => {
    expect(budgetAlerts({ sprintTokens: 13, used: measured }).sprint.text).toBe("within")
    expect(budgetAlerts({ sprintTokens: 13, used: measured }).sprint.provenance).toBe("config.bounds.sprint_tokens")
    expect(budgetAlerts({ sprintTokens: 12, used: measured }).sprint.text).toBe("exceeded")
  })

  test("does not invent a sprint alert from an unknown aggregate", () => {
    expect(budgetAlerts({ sprintTokens: 10, used: { state: "unknown" } }).sprint.text).toBe("unknown")
  })

  test("compares pack tokens with the context window", () => {
    expect(budgetAlerts({ contextWindow: 20, contextTokens: measured }).context.text).toBe("within")
    expect(budgetAlerts({ contextWindow: 10, contextTokens: measured }).context.text).toBe("exceeded")
    expect(budgetAlerts({ contextWindow: 10, contextTokens: { state: "unknown" } }).context.text).toBe("unknown")
  })

  test("shows a read retry count, including zero", () => {
    expect(budgetAlerts({ retries: 0 }).retries).toEqual({ text: "0", provenance: "session.next.retried" })
    expect(budgetAlerts({ retries: 2 }).retries.text).toBe("2")
  })

  test("treats bound stops as an empty run and ignores interrupt", () => {
    expect(budgetAlerts({ stopReason: "budget" }).emptyRun.text).toBe("budget")
    expect(budgetAlerts({ stopReason: "interrupt" }).emptyRun.text).toBe("unknown")
  })
})
