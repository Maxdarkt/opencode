import type { ServerSDK } from "@/context/server-sdk"
import { ContextRequestError, type ContextQuery } from "./project-context-state"

export async function readProjectContext(
  sdk: Pick<ServerSDK, "protocol" | "client">,
  query: ContextQuery,
  signal?: AbortSignal,
) {
  if ((await sdk.protocol) !== "v1") throw new ContextRequestError("protocol")
  const response = await sdk.client.global.context(query, { signal, throwOnError: false }).catch(() => {
    throw new ContextRequestError("network")
  })
  if (!response.response) throw new ContextRequestError("network")
  if (response.response.status === 401 || response.response.status === 403) throw new ContextRequestError("auth")
  if (!response.response.ok) throw new ContextRequestError("server")
  if (!response.data || response.data.requested_directory !== query.directory) throw new ContextRequestError("response")
  return response.data
}
