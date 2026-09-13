import { describe, expect, test } from "bun:test"
import { agentBannerView, agentRunState, currentTool } from "./agent-banner"

describe("agentBannerView", () => {
  test("maps idle vs running from session status", () => {
    expect(agentRunState("idle")).toBe("idle")
    expect(agentRunState(undefined)).toBe("idle")
    expect(agentBannerView({ status: "idle" }).runState).toBe("idle")
    expect(agentBannerView({ status: "busy" }).runState).toBe("running")
    expect(agentBannerView({ status: "retry" }).runState).toBe("running")
  })

  test("shows Interrupt only while running", () => {
    expect(agentBannerView({ status: "idle" }).interrupt).toBe(false)
    expect(agentBannerView({ status: "busy" }).interrupt).toBe(true)
    expect(agentBannerView({ status: "retry" }).interrupt).toBe(true)
  })

  test("uses the last running tool part and observed cwd, else unknown", () => {
    const view = agentBannerView({
      status: "busy",
      cwd: "/Users/leanbot/Documents/40_Daidalon/features/tasks/DA10-008",
      messages: [{ id: "msg_1" }, { id: "msg_2" }],
      parts: {
        msg_1: [{ type: "tool", tool: "read", state: { status: "running" } }],
        msg_2: [
          { type: "tool", tool: "glob", state: { status: "completed" } },
          { type: "tool", tool: "bash", state: { status: "running" } },
        ],
      },
    })
    expect(view.tool).toBe("bash")
    expect(view.cwd).toBe("/Users/leanbot/Documents/40_Daidalon/features/tasks/DA10-008")
    expect(currentTool({})).toBe("unknown")
    expect(agentBannerView({}).cwd).toBe("unknown")
    expect(agentBannerView({ cwd: "" }).cwd).toBe("unknown")
  })
})
