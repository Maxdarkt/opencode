import { Button } from "@opencode-ai/ui/button"
import { Spinner } from "@opencode-ai/ui/spinner"
import { A, useNavigate } from "@solidjs/router"
import { createMemo, createResource, For, Show } from "solid-js"
import { createStore } from "solid-js/store"
import { useLanguage } from "@/context/language"
import { useServerSDK } from "@/context/server-sdk"
import { showToast } from "@/utils/toast"
import { type PreviewTab, type SensitiveAction } from "./sprint-cockpit-fixtures"
import { sprintCockpitInput } from "./sprint-cockpit-input"
import { cockpitLaunchEnabled, confirmCockpitAction } from "./sprint-cockpit-launch"
import { loadSprintCockpit } from "./sprint-cockpit-load"
import { cockpitEligibilityBadge, type CockpitTaskView, type CockpitWorktreeView, type DisplayFact } from "./sprint-cockpit-mapper"
import { cockpitPromptText, copyCockpitPrompt } from "./sprint-cockpit-prompt"
import { SESSION_SPRINT_COCKPIT_HREF } from "./session/session-sprint-rail"
import { createCockpitLayoutState, reduceCockpitLayoutState, type RightPanelTab } from "./sprint-cockpit-state"

const previewLabel = (language: ReturnType<typeof useLanguage>, tab: PreviewTab) => {
  if (tab === "chat") return language.t("sprint.cockpit.preview.chat")
  if (tab === "terminal") return language.t("sprint.cockpit.preview.terminal")
  if (tab === "git") return language.t("sprint.cockpit.preview.git")
  return language.t("sprint.cockpit.preview.browser")
}

const actionLabel = (language: ReturnType<typeof useLanguage>, action: SensitiveAction) => {
  if (action === "launch") return language.t("sprint.cockpit.action.launch")
  if (action === "commit") return language.t("sprint.cockpit.action.commit")
  if (action === "merge") return language.t("sprint.cockpit.action.merge")
  return language.t("sprint.cockpit.action.production")
}

const panelLabel = (language: ReturnType<typeof useLanguage>, tab: RightPanelTab) => {
  if (tab === "taskStatus") return language.t("sprint.cockpit.panel.taskStatus")
  if (tab === "verifiableContext") return language.t("sprint.cockpit.panel.verifiableContext")
  return language.t("sprint.cockpit.panel.repositoryTopology")
}

export function SprintCockpit() {
  const language = useLanguage()
  const navigate = useNavigate()
  const serverSDK = useServerSDK()
  const [view] = createResource(() => loadSprintCockpit(serverSDK().client.global))
  const [state, setState] = createStore(createCockpitLayoutState())
  const selectedTask = createMemo<CockpitTaskView | undefined>(() => {
    return view()?.tasks.find((task) => task.id === state.selectedTaskId) ?? view()?.tasks[0]
  })
  const promptText = createMemo(() => {
    const task = selectedTask()
    if (!task) return null
    return cockpitPromptText(task)
  })
  const launchEnabled = createMemo(() => cockpitLaunchEnabled(selectedTask()))

  const dispatch = (intent: Parameters<typeof reduceCockpitLayoutState>[1]) => {
    setState(reduceCockpitLayoutState(state, intent))
  }

  const confirmAction = async () => {
    const action = state.confirmation
    dispatch({ type: "closeConfirmation" })
    if (!action) return
    const result = await confirmCockpitAction({
      action,
      task: selectedTask(),
      global: serverSDK().client.global,
    })
    if (result.type === "opened") {
      navigate(result.href)
      return
    }
    if (result.type === "failed") dispatch({ type: "setLaunchError", message: language.t("sprint.cockpit.launchFailed") })
  }

  const copyPrompt = () => {
    const text = promptText()
    if (!text) return
    void copyCockpitPrompt(text).then((copied) => {
      showToast({
        title: copied ? language.t("sprint.cockpit.copyPromptSuccess") : language.t("sprint.cockpit.copyPromptFailed"),
      })
    })
  }

  return (
    <div class="flex h-screen min-h-[640px] flex-col overflow-hidden bg-background-base text-text-base">
      <header class="flex shrink-0 items-center justify-between gap-3 border-b border-border-weak-base px-5 py-3">
        <div class="min-w-0">
          <div class="text-14-medium truncate">{language.t("sprint.cockpit.title")}</div>
          <div class="text-12-regular text-text-weak truncate">{sprintCockpitInput.sprintID}</div>
        </div>
        <div class="shrink-0 rounded border border-yellow-500/40 bg-yellow-500/10 px-3 py-1 text-11-medium text-yellow-200">
          {view()?.source === "inaccessible"
            ? language.t("sprint.cockpit.inaccessibleBanner")
            : language.t("sprint.cockpit.readOnlyBanner")}
        </div>
      </header>

      <main class="relative flex min-h-0 flex-1 overflow-hidden">
        <aside class="flex w-64 shrink-0 flex-col border-r border-border-weak-base bg-background-stronger max-[1199px]:w-16">
          <div class="border-b border-border-weak-base px-4 py-4 max-[1199px]:px-2">
            <div class="text-12-medium text-text-weak max-[1199px]:sr-only">{language.t("sprint.cockpit.taskStack")}</div>
          </div>
          <div class="min-h-0 flex-1 overflow-y-auto p-2">
            <A
              href={SESSION_SPRINT_COCKPIT_HREF}
              data-component="sprint-cockpit-rail-pilot"
              aria-current="page"
              class="mb-1 block w-full rounded px-2 py-2 text-left bg-background-base outline outline-1 outline-border-weak-base"
            >
              <div class="truncate text-12-medium">{language.t("session.workbench.rail.pilot")}</div>
              <div class="mt-1 truncate text-11-regular text-text-weak max-[1199px]:sr-only">
                {language.t("session.workbench.rail.pilotHint")}
              </div>
            </A>
            <For each={view()?.tasks ?? []}>
              {(task) => (
                <TaskRailItem
                  task={task}
                  language={language}
                  selected={state.selectedTaskId === task.id}
                  onSelect={() => dispatch({ type: "selectTask", taskId: task.id })}
                />
              )}
            </For>
          </div>
        </aside>

        <section class="min-w-0 flex-1 overflow-y-auto px-5 py-5">
          <div class="mx-auto flex max-w-5xl flex-col gap-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="text-16-medium truncate">{state.view === "cockpit" ? language.t("sprint.cockpit.title") : selectedTask()?.id}</div>
                <div class="mt-1 text-12-regular text-text-weak">
                  {state.view === "cockpit" ? language.t("sprint.cockpit.pilotChat") : selectedTask()?.worktreeLabel.text}
                </div>
                <Show when={state.view === "cockpit"}>
                  <div class="mt-1 text-11-regular text-text-weak" data-testid="sprint-cockpit-no-write-tools">
                    {language.t("sprint.cockpit.pilotNoWriteTools")}
                  </div>
                </Show>
              </div>
              <Show when={state.view === "task"}>
                <Button size="small" variant="ghost" onClick={() => dispatch({ type: "showCockpit" })}>
                  {language.t("sprint.cockpit.backToCockpit")}
                </Button>
              </Show>
            </div>

            <div class="rounded border border-border-weak-base bg-background-stronger p-4">
              <div class="mb-3 text-13-medium">{language.t("sprint.cockpit.canvas.title")}</div>
              <div class="mb-3 flex flex-wrap gap-1" role="tablist" aria-label={language.t("sprint.cockpit.canvas.tabs")}>
                <For each={["chat", "terminal", "git", "browser"] as PreviewTab[]}>
                  {(tab) => (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={state.canvasTab === tab}
                      class="rounded px-3 py-1.5 text-11-medium text-text-weak hover:bg-background-base"
                      classList={{ "bg-background-base text-text-base": state.canvasTab === tab }}
                      onClick={() => dispatch({ type: "selectPreview", tab })}
                    >
                      {previewLabel(language, tab)}
                    </button>
                  )}
                </For>
              </div>
              <div class="min-h-48 rounded bg-background-base p-4 text-12-regular text-text-weak" role="tabpanel">
                <Show when={state.canvasTab === "chat" && selectedTask()?.sessionHref}>
                  {(href) => (
                    <a class="text-12-medium text-blue-300 underline" href={href()}>
                      {language.t("sprint.cockpit.openSession")}
                    </a>
                  )}
                </Show>
                <Show when={state.canvasTab === "chat" && !selectedTask()?.sessionHref}>
                  <div>{selectedTask()?.chatPreview.text ?? language.t("sprint.cockpit.fact.unknown")}</div>
                </Show>
                <Show when={state.canvasTab !== "chat"}>
                  <div>{language.t("sprint.cockpit.canvas.inert")}</div>
                </Show>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <For each={["launch", "commit", "merge", "production"] as SensitiveAction[]}>
                {(action) => (
                  <Button
                    size="small"
                    variant="secondary"
                    disabled={action === "launch" && !launchEnabled()}
                    data-testid={action === "launch" ? "sprint-cockpit-launch" : undefined}
                    onClick={() => {
                      if (action === "launch" && !launchEnabled()) return
                      dispatch({ type: "openConfirmation", action })
                    }}
                  >
                    {actionLabel(language, action)}
                  </Button>
                )}
              </For>
            </div>
            <Show when={state.launchError}>
              <div class="text-12-medium text-red-300">{state.launchError}</div>
            </Show>
          </div>
        </section>

        <aside
          class="w-[380px] shrink-0 overflow-y-auto border-l border-border-weak-base bg-background-stronger p-4 max-[1199px]:absolute max-[1199px]:right-0 max-[1199px]:top-0 max-[1199px]:z-10 max-[1199px]:h-full max-[1199px]:shadow-xl"
          classList={{ "max-[1199px]:hidden": !state.mobileDrawerOpen }}
          aria-label={language.t("sprint.cockpit.panel.title")}
        >
          <div class="flex items-center justify-between gap-2">
            <div class="text-13-medium">{language.t("sprint.cockpit.panel.title")}</div>
            <Button size="small" variant="ghost" aria-expanded={state.mobileDrawerOpen} onClick={() => dispatch({ type: "setMobileDrawer", open: false })}>
              {language.t("sprint.cockpit.closeContext")}
            </Button>
          </div>
          <div class="mt-4 flex flex-wrap gap-1" role="tablist" aria-label={language.t("sprint.cockpit.panel.tabs")}>
            <For each={["taskStatus", "verifiableContext", "repositoryTopology"] as RightPanelTab[]}>
              {(tab) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={state.rightPanelTab === tab}
                  class="rounded px-2 py-1 text-11-medium text-text-weak hover:bg-background-base"
                  classList={{ "bg-background-base text-text-base": state.rightPanelTab === tab }}
                  onClick={() => dispatch({ type: "selectRightPanel", tab })}
                >
                  {panelLabel(language, tab)}
                </button>
              )}
            </For>
          </div>
          <Show when={state.rightPanelTab === "taskStatus"}>
            <section class="mt-4" role="tabpanel">
              <InfoCard label={language.t("sprint.cockpit.statusLabel")} value={selectedTask()?.status.text ?? ""} />
              <InfoCard label={language.t("sprint.cockpit.worktree")} value={selectedTask()?.worktree.text ?? ""} mono />
              <InfoCard label={language.t("sprint.cockpit.branchHead")} value={`${selectedTask()?.branch.text ?? ""} · ${selectedTask()?.head.text ?? ""}`} mono />
              <InfoCard label={language.t("sprint.cockpit.budget")} value={`${view()?.metricsCost.text ?? ""} · ${view()?.budgetAlert.text ?? "unknown"}`} />
              <div class="mt-3 text-11-regular text-text-weak" data-testid="sprint-cockpit-no-write-tools-panel">
                {language.t("sprint.cockpit.pilotNoWriteTools")}
              </div>
              <Button
                size="small"
                class="mt-3"
                variant="secondary"
                disabled={!promptText()}
                data-testid="sprint-cockpit-copy-prompt"
                onClick={copyPrompt}
              >
                {language.t("sprint.cockpit.copyPrompt")}
              </Button>
            </section>
          </Show>
          <Show when={state.rightPanelTab === "verifiableContext"}>
            <section class="mt-4" role="tabpanel">
              <InfoCard label={language.t("sprint.cockpit.selectedTask")} value={selectedTask()?.id ?? ""} />
              <InfoCard label={language.t("sprint.cockpit.sprint")} value={sprintCockpitInput.sprintID} />
              <div class="mt-4 rounded border border-border-weak-base p-3 text-11-regular text-text-weak">
                {language.t("sprint.cockpit.contextNote")}
              </div>
            </section>
          </Show>
          <Show when={state.rightPanelTab === "repositoryTopology"}>
            <TopologyPanel worktrees={view()?.worktrees ?? []} sourceRepo={view()?.sourceRepo} language={language} />
          </Show>
        </aside>

        <Show when={!state.mobileDrawerOpen}>
          <Button class="absolute right-3 top-3 z-10 max-[1199px]:block min-[1200px]:hidden" size="small" variant="secondary" onClick={() => dispatch({ type: "setMobileDrawer", open: true })}>
            {language.t("sprint.cockpit.openContext")}
          </Button>
        </Show>
      </main>

      <Show when={state.confirmation}>
        {(action) => (
          <div class="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4" role="presentation">
            <div class="w-full max-w-md rounded border border-border-weak-base bg-background-base p-5 shadow-xl" role="dialog" aria-modal="true">
              <div class="text-16-medium">
                {action() === "launch" ? language.t("sprint.cockpit.launchTitle") : language.t("sprint.cockpit.confirmationTitle")}
              </div>
              <div class="mt-2 text-13-regular text-text-weak">
                {action() === "launch"
                  ? language.t("sprint.cockpit.launchDescription")
                  : language.t("sprint.cockpit.confirmationDescription", { action: actionLabel(language, action()) })}
              </div>
              <Show when={action() !== "launch"}>
                <div class="mt-4 rounded bg-yellow-500/10 p-3 text-12-medium text-yellow-200">{language.t("sprint.cockpit.simulationBanner")}</div>
              </Show>
              <div class="mt-5 flex justify-end gap-2">
                <Button size="small" variant="ghost" onClick={() => dispatch({ type: "closeConfirmation" })}>{language.t("sprint.cockpit.cancel")}</Button>
                <Button size="small" variant="secondary" onClick={() => void confirmAction()}>
                  {action() === "launch" ? language.t("sprint.cockpit.confirmLaunch") : language.t("sprint.cockpit.confirmSimulation")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Show>
    </div>
  )
}

function TaskRailItem(props: { task: CockpitTaskView; language: ReturnType<typeof useLanguage>; selected: boolean; onSelect: () => void }) {
  const indicators = () =>
    [
      props.task.isWorking ? props.language.t("sprint.cockpit.rail.working") : null,
      props.task.hasUnread ? props.language.t("sprint.cockpit.rail.unreadUpdate") : null,
    ]
      .filter(Boolean)
      .join(", ")
  const badge = () => cockpitEligibilityBadge(props.task.eligibility)

  return (
    <button
      type="button"
      data-component="sprint-cockpit-rail-card"
      data-task-id={props.task.id}
      class="mb-1 w-full rounded px-2 py-2 text-left hover:bg-background-base"
      classList={{ "bg-background-base": props.selected }}
      onClick={props.onSelect}
      aria-label={props.language.t("sprint.cockpit.rail.taskAccessible", {
        id: props.task.id,
        title: props.task.title,
        status: props.task.status.text,
        indicators: indicators() || props.language.t("sprint.cockpit.rail.noIndicator"),
      })}
    >
      <div class="flex items-center justify-between gap-2">
        <span class="truncate text-12-medium">{props.task.id}</span>
        <span class="flex shrink-0 items-center gap-1">
          <Show when={badge() === "eligible"}>
            <span data-testid="sprint-rail-eligibility" data-eligibility="eligible" class="text-11-medium text-green-300">
              {props.language.t("sprint.cockpit.rail.eligible")}
            </span>
          </Show>
          <Show when={badge() === "blocked"}>
            <span data-testid="sprint-rail-eligibility" data-eligibility="blocked" class="text-11-medium text-yellow-200">
              {props.language.t("sprint.cockpit.rail.blocked")}
            </span>
          </Show>
        </span>
      </div>
      <div class="mt-1 truncate font-mono text-11-regular text-text-weak max-[1199px]:sr-only">{props.task.worktreeLabel.text}</div>
      <div class="mt-1 flex items-center gap-2 truncate text-11-regular text-text-weak max-[1199px]:sr-only">
        <Show when={props.task.isWorking}>
          <span class="inline-flex shrink-0 items-center gap-1 text-yellow-300">
            <Spinner class="size-3" />
            <span class="sr-only">{props.language.t("sprint.cockpit.rail.working")}</span>
          </span>
        </Show>
        <Show when={props.task.hasUnread}>
          <span class="inline-flex shrink-0 items-center gap-1 text-blue-300">
            <span class="size-2 rounded-full bg-blue-400" aria-hidden="true" />
            <span class="sr-only">{props.language.t("sprint.cockpit.rail.unreadUpdate")}</span>
          </span>
        </Show>
      </div>
    </button>
  )
}

function InfoCard(props: { label: string; value: string; mono?: boolean }) {
  return (
    <div class="mt-2 min-w-0 rounded border border-border-weak-base bg-background-stronger p-3">
      <div class="text-11-medium text-text-weak">{props.label}</div>
      <div class="mt-1 break-words text-12-regular" classList={{ "font-mono": props.mono }}>
        {props.value}
      </div>
    </div>
  )
}

function TopologyPanel(props: {
  worktrees: readonly CockpitWorktreeView[]
  sourceRepo: DisplayFact | undefined
  language: ReturnType<typeof useLanguage>
}) {
  return (
    <section class="mt-4" role="tabpanel">
      <InfoCard label={props.language.t("sprint.cockpit.topology.sourceRepo")} value={props.sourceRepo?.text ?? ""} />
      <For each={props.worktrees}>
        {(worktree) => (
          <div class="mt-3 rounded border border-border-weak-base p-3 text-11-regular">
            <div class="font-mono">{worktree.branch.text}</div>
            <div class="mt-1 break-all text-text-weak">{worktree.path.text}</div>
            <div class="mt-2">{props.language.t("sprint.cockpit.topology.reintegration", { target: worktree.mergeTarget.text })}</div>
            <div class="mt-1 text-text-weak">{worktree.ahead.text} · {worktree.behind.text}</div>
            <div class="mt-1">{worktree.taskID.text}</div>
          </div>
        )}
      </For>
    </section>
  )
}
