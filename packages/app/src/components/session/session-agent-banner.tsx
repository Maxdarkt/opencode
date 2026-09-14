import { Show } from "solid-js"
import { Button } from "@opencode-ai/ui/button"
import { useLanguage } from "@/context/language"
import { agentBannerView, type AgentBannerInput } from "./agent-banner"
import { PackInspector } from "./session-pack-inspector"

export function AgentBanner(
  props: AgentBannerInput & {
    sessionID?: string
    onInterrupt?: () => void
  },
) {
  const language = useLanguage()
  const view = () =>
    agentBannerView({
      status: props.status,
      cwd: props.cwd,
      messages: props.messages,
      parts: props.parts,
    })

  return (
    <div
      data-component="agent-banner"
      data-run-state={view().runState}
      class="flex h-8 shrink-0 items-center gap-3 border-b border-border-weaker-base px-3 text-12-regular text-text-weak"
    >
      <span data-slot="run-state" class="text-12-medium text-text-strong">
        {view().runState === "running" ? language.t("session.banner.running") : language.t("session.banner.idle")}
      </span>
      <span data-slot="tool" class="truncate">
        {language.t("session.banner.tool")}: {view().tool}
      </span>
      <span data-slot="cwd" class="min-w-0 truncate font-mono">
        {language.t("session.banner.cwd")}: {view().cwd}
      </span>
      <span class="ml-auto flex items-center gap-2">
        <Show when={props.sessionID}>{(id) => <PackInspector sessionID={id()} />}</Show>
        <Show when={view().interrupt}>
          <Button
            type="button"
            size="small"
            variant="ghost"
            data-testid="session-interrupt"
            onClick={() => props.onInterrupt?.()}
          >
            {language.t("session.banner.interrupt")}
          </Button>
        </Show>
      </span>
    </div>
  )
}
