export * as TaskPilot from "./task-pilot"

import { TaskPilot as Contract } from "@opencode-ai/schema/task-pilot"

export const ApexPhase = Contract.ApexPhase
export type ApexPhase = Contract.ApexPhase

export const MtStatus = Contract.MtStatus
export type MtStatus = Contract.MtStatus

export const Context = Contract.Context
export type Context = Contract.Context

export const Action = Contract.Action
export type Action = Contract.Action

export const BlockReason = Contract.BlockReason
export type BlockReason = Contract.BlockReason

export const Input = Contract.Input
export type Input = Contract.Input

export const Result = Contract.Result
export type Result = Contract.Result

export function evaluate(input: Input): Result {
  if (input.context === "incomplete") return Contract.Blocked.make({ kind: "blocked", reason: "context_incomplete" })
  if (input.context === "divergent") return Contract.Blocked.make({ kind: "blocked", reason: "context_divergent" })
  if (input.context === "resuming") return Contract.Blocked.make({ kind: "blocked", reason: "execution_resuming" })
  if (input.mtStatus === "blocked") return Contract.Blocked.make({ kind: "blocked", reason: "mt_blocked" })
  if (input.mtStatus === "todo" && input.apexPhase === undefined)
    return Contract.Next.make({ kind: "next", action: "start_analyze" })

  const action =
    input.mtStatus === "in_progress" && input.apexPhase === "analyze"
      ? "write_plan"
      : input.mtStatus === "in_progress" && input.apexPhase === "plan"
        ? "start_build"
        : input.mtStatus === "in_progress" && input.apexPhase === "build"
          ? "run_smoke"
          : input.mtStatus === "in_progress" && input.apexPhase === "smoke"
            ? "verify"
            : input.mtStatus === "in_progress" && input.apexPhase === "verify"
              ? "request_review"
              : (input.mtStatus === "review" || input.mtStatus === "done") && input.apexPhase === "verify"
                ? "parent_close"
                : undefined
  if (action) return Contract.Next.make({ kind: "next", action })
  return Contract.Blocked.make({ kind: "blocked", reason: "invalid_status_phase" })
}
