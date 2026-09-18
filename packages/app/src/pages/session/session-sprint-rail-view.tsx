import { For, Show, createMemo, createResource } from "solid-js"
import { A, useLocation } from "@solidjs/router"
import { createMediaQuery } from "@solid-primitives/media"
import { useLanguage } from "@/context/language"
import { useServerSDK } from "@/context/server-sdk"
import { loadSprintCockpit } from "@/pages/sprint-cockpit-load"
import { cockpitEligibilityBadge, type CockpitTaskView } from "@/pages/sprint-cockpit-mapper"
import {
  SESSION_RAIL_COMPACT_MAX_WIDTH,
  SESSION_RAIL_WIDTH_COMPACT,
  SESSION_RAIL_WIDTH_WIDE,
} from "./session-workbench-layout"
import {
  SESSION_SPRINT_COCKPIT_HREF,
  sessionSprintRailHref,
  sessionSprintRailIndicators,
  sessionSprintRailSelected,
} from "./session-sprint-rail"

export function SessionSprintRail(props: { currentSessionID: string | undefined }) {
  const language = useLanguage()
  const location = useLocation()
  const serverSDK = useServerSDK()
  const compact = createMediaQuery(`(max-width: ${SESSION_RAIL_COMPACT_MAX_WIDTH}px)`)
  const [view] = createResource(() => loadSprintCockpit(serverSDK().client.global))
  const pilotSelected = createMemo(() =>
    sessionSprintRailSelected({
      kind: "pilot",
      href: SESSION_SPRINT_COCKPIT_HREF,
      currentSessionID: props.currentSessionID,
      pathname: location.pathname,
    }),
  )

  return (
    <aside
      data-component="session-sprint-rail"
      class="flex h-full shrink-0 flex-col border-r border-border-weak-base bg-v2-background-bg-base"
      style={{ width: `${compact() ? SESSION_RAIL_WIDTH_COMPACT : SESSION_RAIL_WIDTH_WIDE}px` }}
    >
      <h2 class="shrink-0 px-3 pt-3 pb-2 text-11-medium uppercase tracking-wide text-text-weak">
        <span classList={{ "sr-only": compact() }}>{language.t("session.workbench.rail.title")}</span>
      </h2>
      <nav class="min-h-0 flex-1 overflow-y-auto px-1.5" aria-label={language.t("session.workbench.rail.title")}>
        <A
          href={SESSION_SPRINT_COCKPIT_HREF}
          data-component="session-sprint-rail-pilot"
          aria-current={pilotSelected() ? "page" : undefined}
          class="mb-1 block w-full rounded-lg px-2.5 py-2 text-left hover:bg-background-stronger"
          classList={{ "bg-background-stronger outline outline-1 outline-border-weak-base": pilotSelected() }}
        >
          <div class="flex items-center justify-between gap-2">
            <span class="truncate text-12-medium">{language.t("session.workbench.rail.pilot")}</span>
          </div>
          <div class="mt-0.5 truncate font-mono text-11-regular text-text-weak" classList={{ "sr-only": compact() }}>
            {language.t("session.workbench.rail.pilotHint")}
          </div>
        </A>
        <For each={view()?.tasks ?? []}>
          {(task) => (
            <SessionSprintRailCard
              task={task}
              compact={compact()}
              currentSessionID={props.currentSessionID}
              language={language}
            />
          )}
        </For>
      </nav>
    </aside>
  )
}

function SessionSprintRailCard(props: {
  task: CockpitTaskView
  compact: boolean
  currentSessionID: string | undefined
  language: ReturnType<typeof useLanguage>
}) {
  const href = createMemo(() => sessionSprintRailHref({ kind: "task", sessionHref: props.task.sessionHref }))
  const selected = createMemo(() =>
    sessionSprintRailSelected({
      kind: "task",
      href: href(),
      currentSessionID: props.currentSessionID,
    }),
  )
  const badge = createMemo(() => cockpitEligibilityBadge(props.task.eligibility))
  const indicators = createMemo(() =>
    sessionSprintRailIndicators({
      isWorking: props.task.isWorking,
      hasUnread: props.task.hasUnread,
    }),
  )
  const label = createMemo(() =>
    props.language.t("sprint.cockpit.rail.taskAccessible", {
      id: props.task.id,
      title: props.task.title,
      status: props.task.status.text,
      indicators:
        indicators()
          .map((indicator) =>
            indicator === "working"
              ? props.language.t("sprint.cockpit.rail.working")
              : props.language.t("sprint.cockpit.rail.unreadUpdate"),
          )
          .join(", ") || props.language.t("sprint.cockpit.rail.noIndicator"),
    }),
  )

  return (
    <A
      href={href()}
      data-component="session-sprint-rail-card"
      data-task-id={props.task.id}
      aria-current={selected() ? "page" : undefined}
      aria-label={label()}
      class="mb-1 block w-full rounded-lg px-2.5 py-2 text-left hover:bg-background-stronger"
      classList={{ "bg-background-stronger outline outline-1 outline-border-weak-base": selected() }}
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
          <Show when={indicators().includes("working")}>
            <span class="size-1.5 rounded-full bg-yellow-400" aria-hidden="true" />
            <span class="sr-only">{props.language.t("sprint.cockpit.rail.working")}</span>
          </Show>
          <Show when={indicators().includes("unread")}>
            <span class="size-1.5 rounded-full bg-blue-400" aria-hidden="true" />
            <span class="sr-only">{props.language.t("sprint.cockpit.rail.unreadUpdate")}</span>
          </Show>
        </span>
      </div>
      <div class="mt-0.5 truncate font-mono text-11-regular text-text-weak" classList={{ "sr-only": props.compact }}>
        {props.task.worktreeLabel.text}
      </div>
    </A>
  )
}
