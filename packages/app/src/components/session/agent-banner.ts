export type AgentRunState = "running" | "idle"

export type ToolPartLike = {
  type: string
  tool?: string
  state?: { status?: string }
}

export type AgentBannerInput = {
  status?: string
  cwd?: string
  messages?: ReadonlyArray<{ id: string }>
  parts?: Record<string, ReadonlyArray<ToolPartLike> | undefined>
}

export type AgentBannerView = {
  runState: AgentRunState
  tool: string
  cwd: string
  interrupt: boolean
}

export function agentRunState(status: string | undefined): AgentRunState {
  if (status === "busy" || status === "retry") return "running"
  return "idle"
}

export function currentTool(input: {
  messages?: ReadonlyArray<{ id: string }>
  parts?: Record<string, ReadonlyArray<ToolPartLike> | undefined>
}): string {
  const messages = input.messages ?? []
  for (let i = messages.length - 1; i >= 0; i--) {
    const parts = input.parts?.[messages[i].id] ?? []
    for (let j = parts.length - 1; j >= 0; j--) {
      const part = parts[j]
      if (part.type !== "tool" || part.state?.status !== "running") continue
      return part.tool || "unknown"
    }
  }
  return "unknown"
}

export function observedCwd(cwd: string | undefined): string {
  if (!cwd) return "unknown"
  return cwd
}

export function agentBannerView(input: AgentBannerInput): AgentBannerView {
  const runState = agentRunState(input.status)
  return {
    runState,
    tool: currentTool(input),
    cwd: observedCwd(input.cwd),
    interrupt: runState === "running",
  }
}
