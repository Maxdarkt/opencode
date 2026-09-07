import { canWriteActiveTask, getActiveTaskState, type ActiveTaskContext, type ActiveTaskState } from "./active-task-context-state"

export type ActiveTaskWriteBlockReason = ActiveTaskState | "unavailable"

export function createActiveTaskWriteGuard(
  readContext: () => Promise<ActiveTaskContext>,
  sessionID: string,
  onBlocked?: (reason: ActiveTaskWriteBlockReason) => void,
) {
  return async () => {
    try {
      const context = await readContext()
      if (canWriteActiveTask(context, sessionID)) return true
      onBlocked?.(getActiveTaskState(context, sessionID))
      return false
    } catch {
      onBlocked?.("unavailable")
      return false
    }
  }
}
