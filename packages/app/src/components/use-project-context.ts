import { readProjectContext } from "./project-context-request"
import { createEffect, onCleanup } from "solid-js"
import { createStore, reconcile } from "solid-js/store"
import { useGlobal } from "@/context/global"
import type { ServerConnection } from "@/context/server"
import { createContextObservation, type ContextQuery, type ContextState } from "./project-context-state"

export function useProjectContext(input: () => { server: ServerConnection.Any; query: ContextQuery } | undefined) {
  const global = useGlobal()
  const [state, setState] = createStore<ContextState>({ pending: false })
  const observation = createContextObservation((next) => setState(reconcile(next)))
  createEffect(() => {
    const value = input()
    if (!value?.query.directory) {
      observation.cancel()
      return
    }
    const sdk = global.ensureServerCtx(value.server).sdk
    void observation.load(value.query, (query, signal) => readProjectContext(sdk, query, signal))
  })
  onCleanup(() => observation.cancel())
  return state
}
