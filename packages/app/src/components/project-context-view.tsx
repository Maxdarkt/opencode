import { For, Show } from "solid-js"
import { useLanguage } from "@/context/language"
import { getActiveTaskState } from "./active-task-context-state"
import type { ContextState } from "./project-context-state"

export function ProjectContextView(props: { state: ContextState; api: string; directory: string; sessionID?: string }) {
  const language = useLanguage()
  const unknown = () => language.t("project.context.unknown")
  const rows = () => {
    const data = props.state.data
    if (!data) return []
    return [
      [language.t("project.context.requested"), data.requested_directory],
      [language.t("project.context.canonical"), data.canonical_directory ?? unknown()],
      [language.t("project.context.session"), data.session_directory ?? unknown()],
      [language.t("project.context.sessionCanonical"), data.session_canonical_directory ?? unknown()],
      [language.t("project.context.sessionStatus"), language.t(`project.context.session.${data.session_status}`)],
      [language.t("project.context.concordance"), language.t(`project.context.concordance.${data.concordance}`)],
      [language.t("project.context.git"), data.git ? language.t(`project.context.git.${data.git.status}`) : unknown()],
      [language.t("project.context.checkout"), data.git?.top_level ?? unknown()],
      [
        language.t("project.context.branch"),
        data.git?.branch ?? (data.git ? language.t(`project.context.head.${data.git.head_status}`) : unknown()),
      ],
      [language.t("project.context.head"), data.git?.head ?? unknown()],
      [
        language.t("project.context.base"),
        data.git ? language.t(`project.context.base.${data.git.base_status}`) : unknown(),
      ],
      [language.t("project.context.baseRef"), data.git?.base_ref ?? unknown()],
      [language.t("project.context.baseOid"), data.git?.base_oid ?? unknown()],
    ]
  }
  const active = () => {
    const data = props.state.data
    return data ? getActiveTaskState(data, props.sessionID) : undefined
  }
  const taskRows = () => {
    const data = props.state.data
    const task = data?.task
    if (!task) return []
    return [
      [language.t("project.context.task.project"), task.binding.projectID],
      [language.t("project.context.task.sprint"), language.t("project.context.task.sprintUnavailable")],
      [language.t("project.context.task.id"), task.binding.mtTaskID],
      [language.t("project.context.task.session"), task.binding.sessionID],
      [language.t("project.context.task.worktree"), task.binding.checkout.worktree],
      [language.t("project.context.task.branch"), task.binding.checkout.branch],
      [language.t("project.context.task.head"), task.binding.checkout.head],
      [language.t("project.context.task.owner"), task.execution?.ownerID ?? unknown()],
      [language.t("project.context.task.generation"), task.execution?.generation ?? unknown()],
      [
        language.t("project.context.task.effects"),
        task.execution?.effects.map((effect) => `${effect.effectID}: ${effect.state}`).join(", ") || unknown(),
      ],
    ]
  }
  return (
    <section data-component="project-context" class="w-full min-w-0 text-12-regular" aria-live="polite">
      <div class="break-all">{language.t("project.context.api", { url: props.api })}</div>
      <div class="break-all">{props.directory}</div>
      <Show when={props.state.pending}>{language.t("common.loading")}</Show>
      <Show when={props.state.error}>
        {(error) => <div role="alert">{language.t(`project.context.error.${error()}`)}</div>}
      </Show>
      <Show when={props.state.data}>
        {(data) => (
          <>
            <div>{language.t(`project.context.availability.${data().availability}`)}</div>
            <Show when={data().concordance === "mismatch"}>
              <div role="alert">{language.t("project.context.concordance.mismatch")}</div>
            </Show>
            <div data-active-task-state={active()}>{language.t(`project.context.task.state.${active()}`)}</div>
            <Show when={active() !== "concordant"}>
              <div role="alert">{language.t("project.context.task.writeBlocked")}</div>
            </Show>
            <Show when={data().task}>
              <dl class="grid grid-cols-[minmax(100px,auto)_minmax(0,1fr)] gap-x-3 gap-y-1 p-2">
                <For each={taskRows()}>
                  {(row) => (
                    <>
                      <dt>{row[0]}</dt>
                      <dd class="break-all select-text">{row[1]}</dd>
                    </>
                  )}
                </For>
              </dl>
            </Show>
            <details>
              <summary class="cursor-pointer">{language.t("project.context.details")}</summary>
              <dl class="grid grid-cols-[minmax(100px,auto)_minmax(0,1fr)] gap-x-3 gap-y-1 max-h-52 overflow-auto p-2">
                <For each={rows()}>
                  {(row) => (
                    <>
                      <dt>{row[0]}</dt>
                      <dd class="break-all select-text">{row[1]}</dd>
                    </>
                  )}
                </For>
              </dl>
            </details>
          </>
        )}
      </Show>
    </section>
  )
}
