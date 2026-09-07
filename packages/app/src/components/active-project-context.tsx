import { createMemo, Show } from "solid-js"
import { createStore } from "solid-js/store"
import { useLocation, useNavigate, useParams } from "@solidjs/router"
import { useGlobal } from "@/context/global"
import { useLayout } from "@/context/layout"
import { useServer, ServerConnection } from "@/context/server"
import { useTabs, tabKey } from "@/context/tabs"
import { useLanguage } from "@/context/language"
import { base64Encode } from "@opencode-ai/core/util/encode"
import { decode64 } from "@/utils/base64"
import { Button } from "@opencode-ai/ui/button"
import { useProjectContext } from "./use-project-context"
import { ProjectContextView } from "./project-context-view"

export function ActiveProjectContext() {
  const global = useGlobal()
  const layout = useLayout()
  const server = useServer()
  const tabs = useTabs()
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const language = useLanguage()
  const draft = createMemo(() =>
    tabs.store.find((tab) => tab.type === "draft" && tab.draftID === location.query.draftId),
  )
  const conn = createMemo(() => {
    const key =
      decode64(params.serverKey) ??
      draft()?.server ??
      (location.pathname === "/" ? layout.home.selection().server : server.key)
    return global.servers.list().find((item) => ServerConnection.key(item) === key)
  })
  const directory = createMemo(() => {
    const path = decode64(params.dir)
    if (path) return path
    const tab = draft()
    if (tab?.type === "draft") return tab.directory
    if (!params.id) return location.pathname === "/" ? layout.home.selection().directory : undefined
    const connection = conn()
    if (!connection) return undefined
    const session = global.ensureServerCtx(connection).sync.session.lineage.peek(params.id)?.session
    return (
      session?.directory ??
      tabs.info[tabKey({ type: "session", server: ServerConnection.key(connection), sessionId: params.id })]?.directory
    )
  })
  // Key the observer and the explicit base to the active placement, never a previous tab.
  return (
    <Show
      when={conn() && directory() ? `${ServerConnection.key(conn()!)}\n${directory()}\n${params.id ?? ""}` : undefined}
      keyed
    >
      {(_key) => {
        const [state, setState] = createStore({ base: "", requestedBase: "", revision: 0 })
        const context = useProjectContext(() => {
          state.revision
          const connection = conn()
          const path = directory()
          return connection && path
            ? {
                server: connection,
                query: { directory: path, session_id: params.id, base_ref: state.requestedBase || undefined },
              }
            : undefined
        })
        return (
          <div class="w-full shrink-0 border-b border-border-weak-base px-3 py-2 max-h-64 overflow-auto">
            <ProjectContextView
              state={context}
              api={conn()!.http.url}
              directory={directory()!}
              sessionID={params.id}
              onOpenTask={(identity) => navigate(`/${base64Encode(identity.worktree)}/session/${identity.sessionID}`)}
            />
            <form
              class="flex gap-2 items-center mt-1"
              onSubmit={(event) => {
                event.preventDefault()
                setState({ requestedBase: state.base.trim(), revision: state.revision + 1 })
              }}
            >
              <input
                class="min-w-0 border border-border-weak-base rounded px-2 text-12-regular"
                aria-label={language.t("project.context.baseInput")}
                placeholder={language.t("project.context.baseInput")}
                value={state.base}
                onInput={(event) => setState("base", event.currentTarget.value)}
              />
              <Button type="submit" size="small">
                {language.t("project.context.refresh")}
              </Button>
            </form>
          </div>
        )
      }}
    </Show>
  )
}
