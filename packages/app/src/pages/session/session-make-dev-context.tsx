import { createResource } from "solid-js"
import { createSimpleContext } from "@opencode-ai/ui/context"
import { useSDK } from "@/context/sdk"
import { packInspectorServersView, secondaryBrowserView, type MakeDevStatus } from "./session-make-dev"

async function requestMakeDev(sdk: { url: string; directory: string }, path: string, method: "GET" | "POST") {
  const response = await fetch(new URL(path, sdk.url), {
    method,
    headers: { "x-opencode-directory": encodeURIComponent(sdk.directory) },
  })
  if (!response.ok) return { state: "unknown" as const, error: `HTTP ${response.status}` }
  const body = (await response.json()) as { data?: MakeDevStatus }
  return body.data ?? { state: "unknown" as const }
}

export const { use: useMakeDev, provider: MakeDevProvider } = createSimpleContext({
  name: "MakeDev",
  init: () => {
    const sdk = useSDK()
    const [status, actions] = createResource(
      () => sdk().directory,
      (directory) => requestMakeDev({ url: sdk().url, directory }, "/api/make-dev", "GET"),
      { initialValue: { state: "unknown" } satisfies MakeDevStatus },
    )

    const mutate = async (path: "/api/make-dev/start" | "/api/make-dev/stop") => {
      const next = await requestMakeDev(sdk(), path, "POST")
      actions.mutate(next)
      return next
    }

    return {
      status,
      servers: () => packInspectorServersView(status()),
      browser: () => secondaryBrowserView(status()),
      start: () => mutate("/api/make-dev/start"),
      stop: () => mutate("/api/make-dev/stop"),
    }
  },
})
