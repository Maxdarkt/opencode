import { For, Show, createResource, createSignal } from "solid-js"
import { Button } from "@opencode-ai/ui/button"
import { useLanguage } from "@/context/language"
import { useLayout } from "@/context/layout"
import { useSDK } from "@/context/sdk"
import { useServerSDK } from "@/context/server-sdk"
import { useSettings } from "@/context/settings"
import { readProjectContext } from "@/components/project-context-request"
import { loadSprintCockpit } from "@/pages/sprint-cockpit-load"
import { showToast } from "@/utils/toast"
import {
  PACK_INSPECTOR_TABS,
  packInspectorGitView,
  packInspectorMergeAction,
  packInspectorTaskView,
  packInspectorUnknownBody,
  packInspectorView,
  type PackInspectorTab,
  type PackSnapshot,
} from "./pack-inspector"
import { useMakeDev } from "@/pages/session/session-make-dev-context"

export function PackInspector(props: { sessionID: string }) {
  const language = useLanguage()
  const layout = useLayout()
  const sdk = useSDK()
  const serverSDK = useServerSDK()
  const settings = useSettings()
  const [open, setOpen] = createSignal(false)
  const [tab, setTab] = createSignal<PackInspectorTab>("task")
  const [pack] = createResource(
    () => (open() ? props.sessionID : undefined),
    async (sessionID) => {
      const response = await fetch(new URL(`/api/session/${encodeURIComponent(sessionID)}/pack`, sdk().url), {
        headers: { "x-opencode-directory": encodeURIComponent(sdk().directory) },
      })
      if (!response.ok) return undefined
      const body = (await response.json()) as { data?: PackSnapshot }
      return body.data
    },
  )
  const [context] = createResource(
    () => (open() ? props.sessionID : undefined),
    (sessionID) =>
      readProjectContext(sdk(), { directory: sdk().directory, session_id: sessionID }).then(
        (info) => info,
        () => undefined,
      ),
  )
  const [cockpit] = createResource(
    () => (open() ? true : undefined),
    () => loadSprintCockpit(serverSDK().client.global),
  )
  const makeDev = useMakeDev()
  const view = () => packInspectorView({ pack: pack() })
  const git = () => packInspectorGitView(context()?.git)
  const task = () =>
    packInspectorTaskView({
      currentSessionID: props.sessionID,
      tasks: cockpit()?.tasks ?? [],
    })
  const tabLabel = (value: PackInspectorTab) => {
    if (value === "task") return language.t("session.inspector.task")
    if (value === "git") return language.t("session.inspector.git")
    if (value === "context") return language.t("session.inspector.context")
    if (value === "cost") return language.t("session.inspector.cost")
    if (value === "servers") return language.t("session.inspector.servers")
    return language.t("session.inspector.permissions")
  }
  const simulateMerge = () => {
    packInspectorMergeAction()
    showToast({
      title: language.t("session.inspector.mergeSimulated"),
      description: language.t("sprint.cockpit.simulationBanner"),
    })
  }

  return (
    <div class="relative" data-component="pack-inspector">
      <div class="flex items-center">
        <Button
          type="button"
          size="small"
          variant="ghost"
          data-testid="pack-inspector-toggle"
          aria-expanded={open()}
          aria-label={language.t("session.inspector.toggle")}
          title={language.t("session.inspector.toggle")}
          onClick={() => setOpen((value) => !value)}
        >
          ☰
        </Button>
        <Show when={settings.general.newLayoutDesigns()}>
          <Button
            type="button"
            size="small"
            variant="ghost"
            data-testid="session-secondary-toggle"
            aria-pressed={layout.secondary.opened()}
            aria-label={language.t("session.secondary.toggle")}
            title={language.t("session.secondary.toggle")}
            onClick={() => layout.secondary.toggle()}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" stroke-width="1.2" />
              <path d="M9.5 2.5v11" stroke="currentColor" stroke-width="1.2" />
            </svg>
          </Button>
        </Show>
      </div>
      <Show when={open()}>
        <div
          data-testid="pack-inspector-panel"
          class="fixed top-[78px] right-4 z-30 flex max-h-[calc(100vh-120px)] w-[320px] flex-col overflow-auto rounded-xl border border-border-weak-base bg-background-stronger shadow-[0_18px_50px_rgba(0,0,0,.55)]"
        >
          <div class="flex flex-wrap gap-1 border-b border-border-weak-base p-2" role="tablist">
            <For each={PACK_INSPECTOR_TABS}>
              {(value) => (
                <Button
                  type="button"
                  size="small"
                  variant={tab() === value ? "primary" : "ghost"}
                  role="tab"
                  aria-selected={tab() === value}
                  onClick={() => setTab(value)}
                >
                  {tabLabel(value)}
                </Button>
              )}
            </For>
          </div>
          <div class="p-3">
            <Show when={tab() === "task"}>
              <dl class="flex flex-col gap-2 text-12-regular text-text-strong">
                <div>
                  <dt class="text-text-weak">{language.t("session.inspector.task")}</dt>
                  <dd class="font-mono">{task().id}</dd>
                </div>
                <div>
                  <dt class="text-text-weak">{language.t("session.inspector.status")}</dt>
                  <dd>{task().status}</dd>
                </div>
                <div>
                  <dt class="text-text-weak">{language.t("session.inspector.worktree")}</dt>
                  <dd class="truncate font-mono">{task().worktree}</dd>
                </div>
                <div>
                  <dt class="text-text-weak">{language.t("session.inspector.branch")}</dt>
                  <dd class="font-mono">{task().branch}</dd>
                </div>
                <div>
                  <dt class="text-text-weak">{language.t("session.inspector.head")}</dt>
                  <dd class="font-mono">{task().head}</dd>
                </div>
              </dl>
            </Show>
            <Show when={tab() === "git"}>
              <dl class="flex flex-col gap-2 text-12-regular text-text-strong">
                <div>
                  <dt class="text-text-weak">{language.t("session.inspector.branch")}</dt>
                  <dd class="font-mono">{git().branch}</dd>
                </div>
                <div>
                  <dt class="text-text-weak">{language.t("session.inspector.head")}</dt>
                  <dd class="font-mono">{git().head}</dd>
                </div>
                <div>
                  <dt class="text-text-weak">{language.t("session.inspector.dirty")}</dt>
                  <dd>{git().dirty}</dd>
                </div>
                <div>
                  <dt class="text-text-weak">{language.t("session.inspector.review")}</dt>
                  <dd>{git().review}</dd>
                </div>
              </dl>
              <Button type="button" size="small" class="mt-3" onClick={simulateMerge}>
                {language.t("session.inspector.merge")}
              </Button>
            </Show>
            <Show when={tab() === "context"}>
              <dl class="flex flex-col gap-1 text-12-regular text-text-strong">
                <div>
                  <dt class="text-text-weak">{language.t("session.inspector.worktree")}</dt>
                  <dd class="truncate font-mono">{view().worktree}</dd>
                </div>
                <div>
                  <dt class="text-text-weak">{language.t("session.inspector.mandate")}</dt>
                  <dd class="truncate">{view().mandate}</dd>
                </div>
                <div>
                  <dt class="text-text-weak">{language.t("session.inspector.pathset")}</dt>
                  <dd>
                    <Show when={view().pathset.length > 0} fallback={language.t("session.inspector.empty")}>
                      <ul>
                        <For each={view().pathset}>{(path) => <li class="truncate font-mono">{path}</li>}</For>
                      </ul>
                    </Show>
                  </dd>
                </div>
                <div>
                  <dt class="text-text-weak">{language.t("session.inspector.omitted")}</dt>
                  <dd>
                    <Show when={view().omitted.length > 0} fallback={language.t("session.inspector.empty")}>
                      <ul>
                        <For each={view().omitted}>{(path) => <li class="truncate font-mono">{path}</li>}</For>
                      </ul>
                    </Show>
                  </dd>
                </div>
                <div>
                  <dt class="text-text-weak">{language.t("session.inspector.tokensBefore")}</dt>
                  <dd data-slot="tokens-before">{view().tokensBefore}</dd>
                </div>
                <div>
                  <dt class="text-text-weak">{language.t("session.inspector.tokensAfter")}</dt>
                  <dd data-slot="tokens-after">{view().tokensAfter}</dd>
                </div>
              </dl>
            </Show>
            <Show when={tab() === "cost"}>
              <dl class="flex flex-col gap-1 text-12-regular text-text-strong">
                <div>
                  <dt class="text-text-weak">{language.t("session.inspector.tokens")}</dt>
                  <dd data-slot="cost-tokens">{view().tokensAfter}</dd>
                </div>
                <div>
                  <dt class="text-text-weak">{language.t("session.inspector.cost")}</dt>
                  <dd data-slot="cost-value">{view().cost}</dd>
                </div>
              </dl>
            </Show>
            <Show when={tab() === "servers"}>
              <div data-slot="inspector-servers" data-testid="inspector-servers">
                <dl class="flex flex-col gap-2 text-12-regular text-text-strong">
                  <div>
                    <dt class="text-text-weak">{language.t("session.inspector.servers.makeDev")}</dt>
                    <dd data-slot="inspector-servers-state">{makeDev.servers().label}</dd>
                  </div>
                  <div>
                    <dt class="text-text-weak">{language.t("session.inspector.servers.cpuRam")}</dt>
                    <dd data-slot="inspector-servers-cpu">{makeDev.servers().cpuRam}</dd>
                  </div>
                  <Show when={makeDev.servers().error}>
                    <div>
                      <dt class="text-text-weak">{language.t("session.inspector.status")}</dt>
                      <dd class="whitespace-pre-wrap font-mono">{makeDev.servers().error}</dd>
                    </div>
                  </Show>
                </dl>
                <Button
                  type="button"
                  size="small"
                  class="mt-3"
                  disabled={!makeDev.servers().startEnabled && !makeDev.servers().stopEnabled}
                  onClick={() => (makeDev.servers().stopEnabled ? makeDev.stop() : makeDev.start())}
                >
                  {makeDev.servers().stopEnabled
                    ? language.t("session.inspector.servers.stop")
                    : language.t("session.inspector.servers.start")}
                </Button>
              </div>
            </Show>
            <Show when={tab() === "permissions"}>
              <div data-slot="inspector-permissions">{packInspectorUnknownBody()}</div>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  )
}
