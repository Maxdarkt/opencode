export type TaskPilotApexPhase = "analyze" | "plan" | "build" | "smoke" | "verify"

export type TaskPilotMtStatus = "todo" | "in_progress" | "review" | "done" | "blocked"

export type TaskPilotContext = "concordant" | "incomplete" | "divergent" | "resuming"

export type TaskPilotObservation = {
  mtStatus: TaskPilotMtStatus
  apexPhase?: TaskPilotApexPhase
  context: TaskPilotContext
}

export type TaskPilotIdentity = {
  sessionID?: string
  worktree?: string
}

export type TaskPilotExistingIdentity = Required<TaskPilotIdentity>

export type TaskPilotAction =
  | "start_analyze"
  | "write_plan"
  | "start_build"
  | "run_smoke"
  | "verify"
  | "request_review"
  | "parent_close"

export type TaskPilotBlockReason =
  | "context_incomplete"
  | "context_divergent"
  | "execution_resuming"
  | "mt_blocked"
  | "invalid_status_phase"

export type TaskPilotResult =
  | { kind: "next"; action: TaskPilotAction }
  | { kind: "blocked"; reason: TaskPilotBlockReason }

export function hasTaskPilotIdentity(identity?: TaskPilotIdentity): identity is TaskPilotExistingIdentity {
  return !!identity?.sessionID && !!identity.worktree
}

export function evaluateTaskPilot(observation?: TaskPilotObservation): TaskPilotResult {
  if (!observation || observation.context === "incomplete") return { kind: "blocked", reason: "context_incomplete" }
  if (observation.context === "divergent") return { kind: "blocked", reason: "context_divergent" }
  if (observation.context === "resuming") return { kind: "blocked", reason: "execution_resuming" }
  if (observation.mtStatus === "blocked") return { kind: "blocked", reason: "mt_blocked" }

  const action =
    observation.mtStatus === "todo" && observation.apexPhase === undefined
      ? "start_analyze"
      : observation.mtStatus === "in_progress" && observation.apexPhase === "analyze"
        ? "write_plan"
        : observation.mtStatus === "in_progress" && observation.apexPhase === "plan"
          ? "start_build"
          : observation.mtStatus === "in_progress" && observation.apexPhase === "build"
            ? "run_smoke"
            : observation.mtStatus === "in_progress" && observation.apexPhase === "smoke"
              ? "verify"
              : observation.mtStatus === "in_progress" && observation.apexPhase === "verify"
                ? "request_review"
                : (observation.mtStatus === "review" || observation.mtStatus === "done") &&
                    observation.apexPhase === "verify"
                  ? "parent_close"
                  : undefined

  if (!action) return { kind: "blocked", reason: "invalid_status_phase" }
  return { kind: "next", action }
}
