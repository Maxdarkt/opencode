import { expect, test } from "bun:test"
import type { LocalContextInfo } from "@opencode-ai/sdk/v2/client"
import { createOpencodeClient } from "@opencode-ai/sdk/v2/client"
import { createContextObservation, ContextRequestError, type ContextState } from "./project-context-state"
import { readProjectContext } from "./project-context-request"

function info(directory: string): LocalContextInfo {
  return {
    requested_directory: directory,
    canonical_directory: directory,
    availability: "available",
    session_directory: null,
    session_canonical_directory: null,
    session_status: "not_requested",
    concordance: "not_applicable",
    git: null,
  }
}

test("clears old data on a new observation and ignores late responses", async () => {
  const states: ContextState[] = []
  const observation = createContextObservation((state) => states.push(state))
  const old = Promise.withResolvers<LocalContextInfo>()
  const first = observation.load({ directory: "/old" }, () => old.promise)
  await observation.load({ directory: "/new", session_id: "ses_new" }, async () => info("/new"))
  old.resolve(info("/old"))
  await first
  expect(states).toEqual([{ pending: true }, { pending: true }, { pending: false, data: info("/new") }])
})

test("cancellation aborts transport and suppresses late failures", async () => {
  const states: ContextState[] = []
  const observation = createContextObservation((state) => states.push(state))
  const result = Promise.withResolvers<LocalContextInfo>()
  const signals: AbortSignal[] = []
  const pending = observation.load({ directory: "/repo" }, (_query, signal) => {
    signals.push(signal)
    return result.promise
  })
  observation.cancel()
  result.reject(new Error("offline"))
  await pending
  expect(signals[0].aborted).toBeTrue()
  expect(states).toEqual([{ pending: true }, { pending: false }])
})

test("rejects data for a different requested directory", async () => {
  const states: ContextState[] = []
  await createContextObservation((state) => states.push(state)).load({ directory: "/requested" }, async () =>
    info("/other"),
  )
  expect(states.at(-1)).toEqual({ pending: false, error: "response" })
})

test("preserves unavailable and session mismatch diagnostics without substituting paths", async () => {
  const states: ContextState[] = []
  const data = {
    ...info("/missing"),
    availability: "absent" as const,
    canonical_directory: null,
    session_directory: "/session",
    concordance: "unknown" as const,
  }
  await createContextObservation((state) => states.push(state)).load(
    { directory: "/missing", session_id: "ses_test" },
    async () => data,
  )
  expect(states.at(-1)?.data).toEqual(data)
})

test("uses the authenticated legacy context route and explicit query, not the default directory", async () => {
  const requests: Request[] = []
  const client = createOpencodeClient({
    baseUrl: "http://localhost:1234",
    directory: "/wrong",
    headers: { Authorization: "Basic fixture" },
    fetch: transport(async (request) => {
      requests.push(request instanceof Request ? request : new Request(request))
      return Response.json(info("/target"))
    }),
  })
  await readProjectContext(
    { protocol: Promise.resolve("v1"), client },
    { directory: "/target", session_id: "ses_test", base_ref: "main" },
  )
  const url = new URL(requests[0].url)
  expect(url.pathname).toBe("/global/context")
  expect(url.searchParams.get("directory")).toBe("/target")
  expect(url.searchParams.get("session_id")).toBe("ses_test")
  expect(url.searchParams.get("base_ref")).toBe("main")
  expect(requests[0].headers.get("authorization")).toBe("Basic fixture")
})

test("distinguishes auth, network, server and unsupported protocol failures", async () => {
  for (const [status, kind] of [
    [401, "auth"],
    [403, "auth"],
    [500, "server"],
  ] as const) {
    const client = createOpencodeClient({
      baseUrl: "http://localhost",
      fetch: transport(async () => new Response(null, { status })),
    })
    await expect(
      readProjectContext({ protocol: Promise.resolve("v1"), client }, { directory: "/repo" }),
    ).rejects.toEqual(new ContextRequestError(kind))
  }
  const client = createOpencodeClient({
    baseUrl: "http://localhost",
    fetch: transport(async () => {
      throw new Error("offline")
    }),
  })
  await expect(readProjectContext({ protocol: Promise.resolve("v1"), client }, { directory: "/repo" })).rejects.toEqual(
    new ContextRequestError("network"),
  )
  await expect(readProjectContext({ protocol: Promise.resolve("v2"), client }, { directory: "/repo" })).rejects.toEqual(
    new ContextRequestError("protocol"),
  )
})

function transport(read: (request: RequestInfo | URL) => Promise<Response>) {
  return Object.assign(read, { preconnect: () => undefined })
}
