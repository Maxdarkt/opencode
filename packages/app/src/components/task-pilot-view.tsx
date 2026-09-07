import { Button } from "@opencode-ai/ui/button"
import { useLanguage } from "@/context/language"
import {
  evaluateTaskPilot,
  hasTaskPilotIdentity,
  type TaskPilotExistingIdentity,
  type TaskPilotIdentity,
  type TaskPilotObservation,
} from "./task-pilot-state"

export type TaskPilotViewTask = {
  binding: {
    mtTaskID: string
    sessionID: string
    checkout: { worktree: string }
  }
}

export function TaskPilotView(props: {
  task?: TaskPilotViewTask
  observation?: TaskPilotObservation
  onOpen?: (identity: TaskPilotExistingIdentity) => void
}) {
  const language = useLanguage()
  const identity = () =>
    props.task
      ? {
          sessionID: props.task.binding.sessionID,
          worktree: props.task.binding.checkout.worktree,
        }
      : undefined
  const result = () => evaluateTaskPilot(props.observation)
  const blocked = () => {
    const current = result()
    return current.kind === "blocked" ? current.reason : undefined
  }
  const action = () => {
    const current = result()
    return current.kind === "next" ? current.action : undefined
  }
  const canOpen = () => hasTaskPilotIdentity(identity()) && !!props.onOpen

  return (
    <section data-component="task-pilot" class="mt-2 rounded border border-border-weak-base p-2 text-12-regular">
      <div class="font-medium">{language.t("project.context.task.pilot")}</div>
      <dl class="mt-2 grid grid-cols-[minmax(100px,auto)_minmax(0,1fr)] gap-x-3 gap-y-1">
        <dt>{language.t("project.context.task.id")}</dt>
        <dd class="break-all select-text">{props.task?.binding.mtTaskID ?? language.t("project.context.unknown")}</dd>
        <dt>{language.t("project.context.task.pilot.mtStatus")}</dt>
        <dd>{props.observation?.mtStatus ?? language.t("project.context.task.pilot.unobserved")}</dd>
        <dt>{language.t("project.context.task.pilot.apexPhase")}</dt>
        <dd>{props.observation?.apexPhase ?? language.t("project.context.task.pilot.unobserved")}</dd>
        <dt>{language.t("project.context.task.pilot.executionContext")}</dt>
        <dd>{props.observation?.context ?? language.t("project.context.task.pilot.unobserved")}</dd>
        <dt>{language.t("project.context.task.pilot.dependencies")}</dt>
        <dd class="break-all select-text">
          {hasTaskPilotIdentity(identity())
            ? `${identity()!.sessionID} · ${identity()!.worktree}`
            : language.t("project.context.task.pilot.identityUnavailable")}
        </dd>
        <dt>{language.t("project.context.task.pilot.block")}</dt>
        <dd>
          {blocked()
            ? language.t(`project.context.task.pilot.blocked.${blocked()}`)
            : language.t("project.context.task.pilot.none")}
        </dd>
        <dt>{language.t("project.context.task.pilot.nextAction")}</dt>
        <dd>
          {action()
            ? language.t(`project.context.task.pilot.action.${action()}`)
            : language.t("project.context.task.pilot.none")}
        </dd>
      </dl>
      <Button
        class="mt-2 max-w-full"
        size="small"
        disabled={!canOpen()}
        onClick={() => {
          const current = identity()
          if (hasTaskPilotIdentity(current) && props.onOpen) props.onOpen(current)
        }}
      >
        {language.t("project.context.task.pilot.open")}
      </Button>
    </section>
  )
}
