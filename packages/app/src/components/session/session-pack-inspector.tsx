import { For, Show, createResource, createSignal } from "solid-js"
import { Button } from "@opencode-ai/ui/button"
import { useLanguage } from "@/context/language"
import { useSDK } from "@/context/sdk"
import { packInspectorView, type PackSnapshot } from "./pack-inspector"

export function PackInspector(props: { sessionID: string }) {
  const language = useLanguage()
  const sdk = useSDK()
  const [open, setOpen] = createSignal(false)
  const [tab, setTab] = createSignal<"context" | "cost">("context")
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
  const view = () => packInspectorView({ pack: pack() })

  return (
    <div class="relative" data-component="pack-inspector">
      <Button
        type="button"
        size="small"
        variant="ghost"
        data-testid="pack-inspector-toggle"
        aria-expanded={open()}
        onClick={() => setOpen((value) => !value)}
      >
        {language.t("session.inspector.toggle")}
      </Button>
      <Show when={open()}>
        <div
          data-testid="pack-inspector-panel"
          class="absolute right-0 top-8 z-20 w-80 rounded-md border border-border-weaker-base bg-background-stronger p-3 shadow-md"
        >
          <div class="mb-2 flex gap-2">
            <Button
              type="button"
              size="small"
              variant={tab() === "context" ? "primary" : "ghost"}
              onClick={() => setTab("context")}
            >
              {language.t("session.inspector.context")}
            </Button>
            <Button
              type="button"
              size="small"
              variant={tab() === "cost" ? "primary" : "ghost"}
              onClick={() => setTab("cost")}
            >
              {language.t("session.inspector.cost")}
            </Button>
          </div>
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
        </div>
      </Show>
    </div>
  )
}
