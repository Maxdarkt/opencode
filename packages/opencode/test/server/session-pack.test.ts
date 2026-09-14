import { afterEach, describe, expect, mock } from "bun:test"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { Effect, Layer } from "effect"
import { resolve } from "path"
import { Session as SessionNs } from "@/session/session"
import { disposeAllInstances, TestInstance } from "../fixture/fixture"
import { testEffect } from "../lib/effect"
import { httpApiLayer, requestInDirectory } from "./httpapi-layer"

const it = testEffect(Layer.mergeAll(LayerNode.compile(SessionNs.node), httpApiLayer))

afterEach(async () => {
  mock.restore()
  await disposeAllInstances()
})

describe("session pack route", () => {
  it.instance(
    "returns assembled pack with observed worktree and unknown tokens",
    () =>
      Effect.gen(function* () {
        const test = yield* TestInstance
               const created = yield* requestInDirectory("/api/session", test.directory, {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({ location: { directory: test.directory } }),
               })
               expect(created.status).toBe(200)
               const body = (yield* created.json) as { data: { id: string; location: { directory: string } } }
               const pack = yield* requestInDirectory(`/api/session/${body.data.id}/pack`, test.directory)
               expect(pack.status).toBe(200)
               const result = (yield* pack.json) as {
                 data: {
                   worktree: string
                   pathset: unknown[]
                   tokensBefore: { state: string }
                   tokensAfter: { state: string }
                 }
               }
               expect(result.data.worktree).toBe(resolve(body.data.location.directory))
               expect(result.data.worktree).toBe(resolve(test.directory))
        expect(result.data.pathset).toEqual([])
        expect(result.data.tokensBefore.state).toBe("unknown")
        expect(result.data.tokensAfter.state).toBe("unknown")
        expect("value" in result.data.tokensBefore).toBe(false)
      }),
    { git: true },
  )

  it.instance(
    "returns 404 when the session is missing",
    () =>
      Effect.gen(function* () {
        const test = yield* TestInstance
        const pack = yield* requestInDirectory("/api/session/ses_httpapi_missing/pack", test.directory)
        expect(pack.status).toBe(404)
      }),
    { git: true },
  )
})
