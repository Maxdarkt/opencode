import { legacySessionHref } from "@/utils/session-route"
import type { SensitiveAction } from "./sprint-cockpit-fixtures"
import type { TaskEligibility } from "./sprint-cockpit-mapper"

export type LaunchTask = {
  readonly id: string
  readonly apexExternalRef: string
  readonly worktreePath: string | null
  readonly eligibility?: TaskEligibility
}

export type CockpitActionResult =
  | { readonly type: "simulated" }
  | { readonly type: "opened"; readonly href: string }
  | { readonly type: "failed"; readonly message: string }

export function cockpitLaunchEnabled(task: LaunchTask | undefined) {
  if (!task) return false
  if (task.eligibility !== "eligible") return false
  return Boolean(task.worktreePath)
}

export async function confirmCockpitAction(input: {
  action: SensitiveAction
  task: LaunchTask | undefined
  global: {
    taskChatOpen: (
      parameters?: {
        taskChatOpenInput?: { mtTaskID: string; apexExternalRef: string; worktree: string }
      },
      options?: { throwOnError?: boolean },
    ) => Promise<{ response?: { ok?: boolean }; data?: { sessionID: string } }>
  }
}): Promise<CockpitActionResult> {
  if (input.action !== "launch") return { type: "simulated" }
  if (!cockpitLaunchEnabled(input.task) || !input.task?.worktreePath) return { type: "failed", message: "unknown" }
  const opened = await input.global.taskChatOpen(
    {
      taskChatOpenInput: {
        mtTaskID: input.task.id,
        apexExternalRef: input.task.apexExternalRef,
        worktree: input.task.worktreePath,
      },
    },
    { throwOnError: false },
  )
  if (!opened.response?.ok || !opened.data) return { type: "failed", message: "unknown" }
  return { type: "opened", href: legacySessionHref(input.task.worktreePath, opened.data.sessionID) }
}
