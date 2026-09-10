import { RootHttpApi } from "../../src/server/routes/instance/httpapi/api"
import { Authorization } from "../../src/server/routes/instance/httpapi/middleware/authorization"
import { InstanceContextMiddleware } from "../../src/server/routes/instance/httpapi/middleware/instance-context"
import { WorkspaceRoutingMiddleware } from "../../src/server/routes/instance/httpapi/middleware/workspace-routing"
import { expect } from "bun:test"
import { NodeHttpServer, NodeServices } from "@effect/platform-node"
import { Config, ConfigProvider, Effect, Layer, Schema } from "effect"
import { HttpClient, HttpClientRequest, HttpRouter, HttpServer } from "effect/unstable/http"
import { LocalContext } from "@opencode-ai/schema/local-context"
import { HttpApiApp } from "../../src/server/routes/instance/httpapi/server"
import { tmpdirScoped } from "../fixture/fixture"
import { testEffect } from "../lib/effect"
import fs from "fs/promises"
import path from "path"

const served: Layer.Layer<never, Config.ConfigError, HttpServer.HttpServer> = HttpRouter.serve(HttpApiApp.routes, {
  disableListenLog: true,
  disableLogger: true,
})
const http = served.pipe(
  Layer.provide(ConfigProvider.layer(ConfigProvider.fromUnknown({ OPENCODE_SERVER_PASSWORD: "context-test" }))),
  Layer.provideMerge(NodeHttpServer.layerTest),
  Layer.provideMerge(NodeServices.layer),
)
const it = testEffect(http)
const auth = HttpClientRequest.setHeader("authorization", `Basic ${btoa("opencode:context-test")}`)

it.live("authenticates and requires an explicit directory without initializing the target", () =>
  Effect.gen(function* () {
    const dir = yield* tmpdirScoped()
    const client = yield* HttpClient.HttpClient
    expect((yield* client.get(`/global/context?directory=${encodeURIComponent(dir)}`)).status).toBe(401)
    expect((yield* client.execute(HttpClientRequest.get("/global/context").pipe(auth))).status).toBe(400)
    const middlewares = Array.from(RootHttpApi.groups.global.endpoints.context.middlewares, (value) => value.key)
    expect(middlewares).toContain(Authorization.key)
    expect(middlewares).not.toContain(InstanceContextMiddleware.key)
    expect(middlewares).not.toContain(WorkspaceRoutingMiddleware.key)
    const before = yield* Effect.promise(() => fs.readdir(dir))
    const response = yield* client.execute(
      HttpClientRequest.get(`/global/context?directory=${encodeURIComponent(dir)}`).pipe(auth),
    )
    expect(response.status).toBe(200)
    const info = Schema.decodeUnknownSync(LocalContext.Info)(yield* response.json)
    expect(info.git?.status).toBe("non_git")
    expect(info.session_status).toBe("not_requested")
    expect(info.task).toBeNull()
    expect(yield* Effect.promise(() => fs.readdir(dir))).toEqual(before)
    const missing = yield* client.execute(
      HttpClientRequest.get(`/global/context?directory=${encodeURIComponent(path.join(dir, "absent"))}`).pipe(auth),
    )
    expect(Schema.decodeUnknownSync(LocalContext.Info)(yield* missing.json).availability).toBe("absent")
    expect(yield* Effect.promise(() => fs.readdir(dir))).toEqual(before)
  }),
)

it.live("compares the persisted session placement rather than substituting the requested directory", () =>
  Effect.gen(function* () {
    const dir = yield* tmpdirScoped({ git: true, config: { formatter: false, lsp: false } })
    const other = yield* tmpdirScoped()
    const client = yield* HttpClient.HttpClient
    const created = yield* client.execute(
      HttpClientRequest.post(`/session?directory=${encodeURIComponent(dir)}`).pipe(
        auth,
        HttpClientRequest.bodyJsonUnsafe({}),
      ),
    )
    expect(created.status).toBe(200)
    const session = Schema.decodeUnknownSync(Schema.Struct({ id: Schema.String, directory: Schema.String }))(
      yield* created.json,
    )
    const response = yield* client.execute(
      HttpClientRequest.get(
        `/global/context?directory=${encodeURIComponent(other)}&session_id=${session.id}&base_ref=HEAD`,
      ).pipe(auth),
    )
    expect(response.status).toBe(200)
    const info = Schema.decodeUnknownSync(LocalContext.Info)(yield* response.json)
    expect(info.requested_directory).toBe(other)
    expect(info.canonical_directory).toBe(other)
    expect(info.session_directory).toBe(session.directory)
    expect(info.session_status).toBe("found")
    expect(info.concordance).toBe("mismatch")
    const missing = yield* client.execute(
      HttpClientRequest.get(`/global/context?directory=${encodeURIComponent(other)}&session_id=ses_missing`).pipe(auth),
    )
    expect(Schema.decodeUnknownSync(LocalContext.Info)(yield* missing.json).session_status).toBe("missing")
  }),
)
