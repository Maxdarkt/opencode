import fs from "fs/promises"
import path from "path"
import { describe, expect, test } from "bun:test"
import { Context, Effect, Layer } from "effect"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { Location } from "@opencode-ai/core/location"
import { MakeDev, parseMakeEnv, sumProcessTree } from "@opencode-ai/core/make-dev"
import { AbsolutePath } from "@opencode-ai/core/schema"
import { location } from "./fixture/location"
import { tmpdir } from "./fixture/tmpdir"
import { it } from "./lib/effect"

const makefile = String.raw`
-include .make.env
.PHONY: dev
dev:
	@for port in $(BACKEND_PORT) $(UI_PORT); do \
		if lsof -nP -iTCP:$$port -sTCP:LISTEN >/dev/null 2>&1; then \
			echo "Error: port $$port is already listening; no process was stopped" >&2; \
			exit 1; \
		fi; \
	done
	@echo started > .started
	@sleep 60
`.trimStart()

function envFile(code: number) {
  return `WORKTREE_CODE=${code}
BACKEND_PORT=${4100 + code}
UI_PORT=${4400 + code}
HOST=127.0.0.1
`
}

const compile = (directory: string) =>
  LayerNode.compile(MakeDev.node, [
    [
      Location.node,
      Layer.succeed(Location.Service, Location.Service.of(location({ directory: AbsolutePath.make(directory) }))),
    ],
  ]).pipe(Layer.fresh)

const withTmp = <A, E, R>(f: (directory: string) => Effect.Effect<A, E, R>) =>
  Effect.acquireRelease(
    Effect.promise(() => tmpdir()),
    (tmp) => Effect.promise(() => tmp[Symbol.asyncDispose]()),
  ).pipe(Effect.flatMap((tmp) => f(tmp.path)))

const writeStub = (directory: string, code: number) =>
  Effect.promise(async () => {
    await fs.writeFile(path.join(directory, ".make.env"), envFile(code))
    await fs.writeFile(path.join(directory, "Makefile"), makefile)
  })

const listen = (port: number) =>
  Effect.acquireRelease(
    Effect.sync(() => Bun.serve({ hostname: "127.0.0.1", port, fetch: () => new Response("ok") })),
    (server) => Effect.sync(() => server.stop(true)),
  )

describe("sumProcessTree", () => {
  test("sums the owned tree and ignores a foreign pid", () => {
    expect(
      sumProcessTree(
        [
          { pid: 10, ppid: 1, cpuPercent: 40, rssKilobytes: 100 },
          { pid: 11, ppid: 10, cpuPercent: 70.5, rssKilobytes: 50 },
          { pid: 99, ppid: 1, cpuPercent: 5, rssKilobytes: 999 },
        ],
        10,
      ),
    ).toEqual({ cpuPercent: 110.5, rssBytes: 150 * 1024 })
  })

  test("omits a sample when the root pid is absent", () => {
    expect(sumProcessTree([{ pid: 11, ppid: 10, cpuPercent: 1, rssKilobytes: 1 }], 10)).toBeUndefined()
  })
})

describe("parseMakeEnv", () => {
  test("reads ports without guessing", () => {
    expect(
      parseMakeEnv(`# local
WORKTREE_CODE=19
BACKEND_PORT=4119
UI_PORT=4419
`),
    ).toEqual({
      ok: true,
      worktreeCode: 19,
      backendPort: 4119,
      uiPort: 4419,
      host: "127.0.0.1",
    })
  })

  test("rejects a couple that does not match the formula", () => {
    expect(
      parseMakeEnv(`WORKTREE_CODE=19
BACKEND_PORT=4140
UI_PORT=4440
`),
    ).toEqual({
      ok: false,
      error: "code 19 requires backend=4119 ui=4419",
    })
  })

  test("missing file content is unknown", () => {
    expect(parseMakeEnv("HOST=127.0.0.1\n")).toEqual({
      ok: false,
      error: "missing WORKTREE_CODE, BACKEND_PORT or UI_PORT",
    })
  })
})

describe("MakeDev", () => {
  it.live("missing env is unknown and start stays inactive", () =>
    withTmp((directory) =>
      Effect.gen(function* () {
        const service = yield* MakeDev.Service
        expect(yield* service.status()).toMatchObject({ state: "unknown" })
        expect(yield* service.start()).toMatchObject({ state: "unknown" })
      }).pipe(Effect.provide(compile(directory))),
    ),
  )

  it.live("starts only in this directory and stop is a no-op elsewhere", () =>
    withTmp((directoryA) =>
      withTmp((directoryB) =>
        Effect.gen(function* () {
          yield* writeStub(directoryA, 91)
          yield* writeStub(directoryB, 92)
          const ctxA = yield* Layer.build(compile(directoryA))
          const ctxB = yield* Layer.build(compile(directoryB))
          const a = Context.get(ctxA, MakeDev.Service)
          const b = Context.get(ctxB, MakeDev.Service)
          const started = yield* a.start()
          expect(started.state).toBe("on")
          expect(started.backendPort).toBe(4191)
          expect(started.uiPort).toBe(4491)
          expect((yield* b.status()).state).toBe("off")
          expect((yield* b.stop()).state).toBe("off")
          expect((yield* a.status()).state).toBe("on")
          expect((yield* a.stop()).state).toBe("off")
        }),
      ),
    ),
  )

  it.live("does not start when another process already owns the ports", () =>
    withTmp((directory) =>
      Effect.gen(function* () {
        yield* writeStub(directory, 91)
        yield* listen(4491)
        const service = yield* MakeDev.Service
        const started = yield* service.start()
        expect(started.state).toBe("off")
        expect(started.error).toBeTruthy()
        expect((yield* service.stop()).state).toBe("off")
      }).pipe(Effect.provide(compile(directory))),
    ),
  )
})
