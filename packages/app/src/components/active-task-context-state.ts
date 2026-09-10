import type { LocalContextInfo } from "@opencode-ai/sdk/v2/client"

export type ActiveTaskContext = LocalContextInfo

export type ActiveTaskState = "concordant" | "incomplete" | "divergent" | "resuming"

export function getActiveTaskState(context: ActiveTaskContext, sessionID?: string): ActiveTaskState {
  const task = context.task
  if (!task?.execution) return "incomplete"
  const binding = task.binding
  const divergent =
    context.concordance === "mismatch" ||
    (sessionID !== undefined && binding.sessionID !== sessionID) ||
    (context.git?.top_level !== null &&
      context.git?.top_level !== undefined &&
      binding.checkout.worktree !== context.git.top_level) ||
    (context.git?.branch !== null &&
      context.git?.branch !== undefined &&
      binding.checkout.branch !== context.git.branch) ||
    (context.git?.head !== null && context.git?.head !== undefined && binding.checkout.head !== context.git.head)
  if (divergent) return "divergent"
  if (task.execution.effects.some((effect) => effect.state === "pending")) return "resuming"
  return "concordant"
}

export function canWriteActiveTask(context: ActiveTaskContext, sessionID?: string) {
  return getActiveTaskState(context, sessionID) === "concordant"
}
