import { For, Show, createEffect, createMemo, createSignal } from "solid-js"
import { Button } from "@opencode-ai/ui/button"
import FileTreeV2 from "@/components/file-tree-v2"
import { useFile } from "@/context/file"
import { useLanguage } from "@/context/language"
import { useLayout } from "@/context/layout"
import { useSDK } from "@/context/sdk"
import { showToast } from "@/utils/toast"
import {
  SECONDARY_KINDS,
  secondaryDiffView,
  secondaryFileBody,
  secondaryFileCrumb,
  secondaryPathStatus,
  type SecondaryDiff,
  type SecondaryKind,
} from "./session-secondary"
import { useMakeDev } from "./session-make-dev-context"

export function SessionSecondaryPanel(props: { diffs: () => readonly SecondaryDiff[] }) {
  const language = useLanguage()
  const layout = useLayout()
  const [menu, setMenu] = createSignal(false)
  const active = createMemo(() => layout.secondary.tabs().find((tab) => tab.id === layout.secondary.active()))
  const kindLabel = (kind: SecondaryKind) => {
    if (kind === "browser") return language.t("session.secondary.browser")
    if (kind === "diff") return language.t("session.secondary.diff")
    return language.t("session.secondary.files")
  }

  return (
    <aside
      data-testid="session-secondary"
      class="relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-visible border-l border-border-weak-base bg-background-stronger"
    >
      <div class="relative z-20 flex min-h-9 shrink-0 items-center gap-0.5 overflow-visible border-b border-border-weak-base px-1.5">
        <div class="flex min-w-0 flex-1 items-center gap-0.5 overflow-auto">
          <For each={layout.secondary.tabs()}>
            {(tab) => (
              <button
                type="button"
                class="flex max-w-40 shrink-0 items-center gap-1.5 rounded-t-md px-2 py-1.5 text-12-regular text-text-weak"
                classList={{ "bg-background-base text-text-strong": tab.id === layout.secondary.active() }}
                aria-selected={tab.id === layout.secondary.active()}
                onClick={() => layout.secondary.focus(tab.id)}
              >
                <span class="truncate">{kindLabel(tab.kind)}</span>
                <span
                  class="px-0.5 text-text-weak"
                  aria-label={language.t("session.secondary.close")}
                  onClick={(event) => {
                    event.stopPropagation()
                    layout.secondary.closeTab(tab.id)
                  }}
                >
                  ×
                </span>
              </button>
            )}
          </For>
        </div>
        <div class="relative shrink-0 overflow-visible">
          <Button
            type="button"
            size="small"
            variant="ghost"
            aria-expanded={menu()}
            aria-label={language.t("session.secondary.add")}
            title={language.t("session.secondary.add")}
            onClick={() => setMenu((value) => !value)}
          >
            +
          </Button>
          <Show when={menu()}>
            <div class="absolute top-7 left-0 z-30 min-w-40 overflow-visible rounded-lg border border-border-weak-base bg-background-stronger p-1">
              <For each={SECONDARY_KINDS}>
                {(kind) => (
                  <button
                    type="button"
                    class="block w-full rounded-md px-2.5 py-2 text-left text-12-regular text-text-strong hover:bg-background-base"
                    onClick={() => {
                      layout.secondary.add(kind)
                      setMenu(false)
                    }}
                  >
                    {kindLabel(kind)}
                  </button>
                )}
              </For>
            </div>
          </Show>
        </div>
      </div>
      <Show when={active()?.kind === "files"}>
        <SecondaryFilesPane />
      </Show>
      <Show when={active()?.kind === "diff"}>
        <SecondaryDiffPane diffs={props.diffs} />
      </Show>
      <Show when={active()?.kind === "browser"}>
        <SecondaryBrowserPane />
      </Show>
    </aside>
  )
}

function SecondaryFilesPane() {
  const file = useFile()
  const language = useLanguage()
  const sdk = useSDK()
  const [selected, setSelected] = createSignal<string>()
  createEffect(() => {
    const path = selected()
    if (!path) return
    if (secondaryPathStatus(path, sdk().directory) === "omitted") return
    void file.load(path)
  })
  const crumb = createMemo(() => secondaryFileCrumb(selected()))
  const body = createMemo(() => {
    const path = selected()
    if (!path) return secondaryFileBody({})
    if (secondaryPathStatus(path, sdk().directory) === "omitted") return secondaryFileBody({ omitted: true })
    const loaded = file.get(path)
    if (loaded?.error) return secondaryFileBody({ error: true })
    if (loaded?.content?.type === "text") return secondaryFileBody({ content: loaded.content.content })
    if (loaded?.loaded) return secondaryFileBody({ error: true })
    return secondaryFileBody({})
  })

  return (
    <>
      <div class="shrink-0 truncate border-b border-border-weak-base px-3 py-1.5 font-mono text-11-regular text-text-weak">
        {crumb()}
      </div>
      <div class="flex min-h-0 flex-1">
        <pre class="min-h-0 min-w-0 flex-1 overflow-auto p-3 text-12-regular text-text-strong whitespace-pre-wrap">
          {body()}
        </pre>
        <aside
          data-testid="session-secondary-files-tree"
          class="w-44 shrink-0 overflow-auto border-l border-border-weak-base"
        >
          <div class="px-2 py-1.5 text-11-medium text-text-weak">{language.t("session.secondary.explorer")}</div>
          <FileTreeV2 active={selected()} onFileClick={(node) => setSelected(node.path)} />
        </aside>
      </div>
    </>
  )
}

function SecondaryDiffPane(props: { diffs: () => readonly SecondaryDiff[] }) {
  const language = useLanguage()
  const [selected, setSelected] = createSignal<string>()
  const view = createMemo(() => secondaryDiffView(props.diffs(), selected()))
  const leaf = (path: string) => path.replaceAll("\\", "/").split("/").filter(Boolean).at(-1) ?? path

  return (
    <div data-testid="session-secondary-diff" class="flex min-h-0 flex-1 flex-col">
      <div class="shrink-0 truncate border-b border-border-weak-base px-3 py-1.5 text-11-regular text-text-weak">
        {language.t("session.secondary.diff.crumb")}
      </div>
      <Show
        when={!view().empty}
        fallback={
          <div class="p-3 text-12-regular text-text-weak">{language.t("session.secondary.diff.empty")}</div>
        }
      >
        <div class="flex min-h-0 flex-1">
          <div class="w-60 shrink-0 overflow-auto border-r border-border-weak-base">
            <For each={view().items}>
              {(item) => (
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-12-regular text-text-weak"
                  classList={{ "bg-background-base text-text-strong": item.file === (selected() ?? view().items[0]?.file) }}
                  onClick={() => setSelected(item.file)}
                >
                  <span class="truncate">{leaf(item.file)}</span>
                  <span class="shrink-0 font-mono">
                    <span class="text-icon-success-base">+{item.additions}</span>{" "}
                    <span class="text-icon-critical-base">−{item.deletions}</span>
                  </span>
                </button>
              )}
            </For>
          </div>
          <pre class="min-h-0 min-w-0 flex-1 overflow-auto p-3 text-12-regular text-text-strong whitespace-pre-wrap">
            {view().patch}
          </pre>
        </div>
      </Show>
    </div>
  )
}

function SecondaryBrowserPane() {
  const language = useLanguage()
  const makeDev = useMakeDev()
  const view = makeDev.browser()
  const simulateTab = () => {
    showToast({
      title: language.t("session.secondary.browser.simulated"),
      description: language.t("sprint.cockpit.simulationBanner"),
    })
  }

  return (
    <div data-testid="session-secondary-browser" class="flex min-h-0 flex-1 flex-col">
      <div class="shrink-0 truncate border-b border-border-weak-base px-3 py-1.5 text-11-regular text-text-weak">
        {language.t("session.secondary.browser")}
      </div>
      <div class="flex min-h-0 flex-1 flex-col gap-2 p-3">
        <div class="flex items-center gap-2">
          <div class="min-w-0 flex-1 truncate rounded-md border border-border-weak-base px-2 py-1 font-mono text-12-regular text-text-weak">
            {view.url}
          </div>
          <Button type="button" size="small" onClick={simulateTab}>
            {language.t("session.secondary.browser.addTab")}
          </Button>
        </div>
        <Show
          when={view.iframe}
          fallback={<div class="text-12-regular text-text-weak">{language.t("session.secondary.browser.hint")}</div>}
        >
          <iframe
            data-testid="session-secondary-browser-frame"
            class="min-h-0 min-w-0 flex-1 rounded-md border border-border-weak-base bg-background-base"
            src={view.url}
            title={language.t("session.secondary.browser")}
          />
        </Show>
      </div>
    </div>
  )
}
