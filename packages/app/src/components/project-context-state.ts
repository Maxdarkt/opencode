import type { LocalContextInfo } from "@opencode-ai/sdk/v2/client"

export type ContextQuery = { directory: string; session_id?: string; base_ref?: string }
export type ContextFailure = "auth" | "network" | "protocol" | "response" | "server"
export type ContextState = { pending: boolean; data?: LocalContextInfo; error?: ContextFailure }

export class ContextRequestError extends Error {
  readonly kind: ContextFailure
  constructor(kind: ContextFailure) {
    super(kind)
    this.kind = kind
  }
}

export function createContextObservation(publish: (state: ContextState) => void) {
  let active: AbortController | undefined
  return {
    cancel() {
      active?.abort()
      active = undefined
      publish({ pending: false })
    },
    async load(query: ContextQuery, read: (query: ContextQuery, signal: AbortSignal) => Promise<LocalContextInfo>) {
      active?.abort()
      const request = new AbortController()
      active = request
      publish({ pending: true })
      await read(query, request.signal).then(
        (data) => {
          if (request.signal.aborted) return
          if (data.requested_directory !== query.directory) {
            publish({ pending: false, error: "response" })
            return
          }
          publish({ pending: false, data })
        },
        (cause: unknown) => {
          if (request.signal.aborted) return
          publish({ pending: false, error: cause instanceof ContextRequestError ? cause.kind : "network" })
        },
      )
    },
  }
}
