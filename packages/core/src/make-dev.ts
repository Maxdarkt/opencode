export * as MakeDev from "./make-dev"

import { makeLocationNode } from "./effect/app-node"
import { AppProcess } from "./process"
import { FSUtil } from "./fs-util"
import { Location } from "./location"
import { MakeDev } from "@opencode-ai/schema/make-dev"
import { Context, Duration, Effect, Layer, Option, Scope, Stream } from "effect"
import { ChildProcess } from "effect/unstable/process"
import type { ChildProcessHandle } from "effect/unstable/process/ChildProcessSpawner"
import path from "path"

export const Status = MakeDev.Status
export type Status = MakeDev.Status

export type ParsedMakeEnv =
  | {
      readonly ok: true
      readonly worktreeCode: number
      readonly backendPort: number
      readonly uiPort: number
      readonly host: string
    }
  | { readonly ok: false; readonly error: string }

export function parseMakeEnv(text: string): ParsedMakeEnv {
  const values: Record<string, string> = {}
  for (const raw of text.split("\n")) {
    const line = raw.trim()
    if (!line || line.startsWith("#")) continue
    const eq = line.indexOf("=")
    if (eq <= 0) continue
    values[line.slice(0, eq).trim()] = line.slice(eq + 1).trim()
  }
  const codeText = values.WORKTREE_CODE
  const backendText = values.BACKEND_PORT
  const uiText = values.UI_PORT
  if (!codeText || !backendText || !uiText) {
    return { ok: false, error: "missing WORKTREE_CODE, BACKEND_PORT or UI_PORT" }
  }
  if (!/^\d+$/.test(codeText) || !/^\d+$/.test(backendText) || !/^\d+$/.test(uiText)) {
    return { ok: false, error: "WORKTREE_CODE, BACKEND_PORT and UI_PORT must be numeric" }
  }
  const worktreeCode = Number(codeText)
  const backendPort = Number(backendText)
  const uiPort = Number(uiText)
  if (backendPort !== 4100 + worktreeCode || uiPort !== 4400 + worktreeCode) {
    return {
      ok: false,
      error: `code ${worktreeCode} requires backend=${4100 + worktreeCode} ui=${4400 + worktreeCode}`,
    }
  }
  const host = values.HOST || "127.0.0.1"
  if (!host) return { ok: false, error: "HOST is empty" }
  return { ok: true, worktreeCode, backendPort, uiPort, host }
}

export interface Interface {
  readonly status: () => Effect.Effect<Status>
  readonly start: () => Effect.Effect<Status>
  readonly stop: () => Effect.Effect<Status>
}

export class Service extends Context.Service<Service, Interface>()("@opencode/v2/MakeDev") {}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const fs = yield* FSUtil.Service
    const location = yield* Location.Service
    const process = yield* AppProcess.Service
    const scope = yield* Scope.Scope
    let owned: ChildProcessHandle | undefined

    const envPath = path.join(location.directory, ".make.env")

    const readEnv = Effect.fnUntraced(function* () {
      const text = yield* fs.readFileStringSafe(envPath).pipe(Effect.catch(() => Effect.succeed(undefined)))
      if (text === undefined) return { ok: false as const, error: "missing .make.env" }
      return parseMakeEnv(text)
    })

    const fromEnv = (env: ParsedMakeEnv, state: Status["state"], error?: string): Status => {
      if (!env.ok) return { state: "unknown", error: error ?? env.error }
      return {
        state,
        host: env.host,
        backendPort: env.backendPort,
        uiPort: env.uiPort,
        worktreeCode: env.worktreeCode,
        ...(error ? { error } : {}),
      }
    }

    const alive = Effect.fnUntraced(function* () {
      if (!owned) return false
      return yield* owned.isRunning.pipe(Effect.orElseSucceed(() => false))
    })

    const drop = Effect.fnUntraced(function* () {
      const handle = owned
      owned = undefined
      if (!handle) return
      yield* handle.kill({ forceKillAfter: Duration.seconds(2) }).pipe(Effect.ignore)
    })

    yield* Effect.addFinalizer(() => drop())

    const status = Effect.fn("MakeDev.status")(function* () {
      if (owned && !(yield* alive())) owned = undefined
      const env = yield* readEnv()
      if (owned) return fromEnv(env, env.ok ? "on" : "unknown")
      if (!env.ok) return fromEnv(env, "unknown")
      return fromEnv(env, "off")
    })

    const start = Effect.fn("MakeDev.start")(function* () {
      if (yield* alive()) return yield* status()
      const env = yield* readEnv()
      if (!env.ok) return fromEnv(env, "unknown")
      const spawned = yield* process
        .spawn(
          ChildProcess.make("make", ["-C", location.directory, "dev"], {
            cwd: location.directory,
            stdin: "ignore",
            detached: globalThis.process.platform !== "win32",
          }),
        )
        .pipe(
          Effect.provideService(Scope.Scope, scope),
          Effect.map((handle) => ({ ok: true as const, handle })),
          Effect.catch((error) => Effect.succeed({ ok: false as const, error: String(error) })),
        )
      if (!spawned.ok) return fromEnv(env, "off", spawned.error)
      const handle = spawned.handle
      const early = yield* handle.exitCode.pipe(
        Effect.timeoutOption(Duration.millis(800)),
        Effect.catch(() => Effect.succeed(Option.none())),
      )
      if (Option.isSome(early)) {
        const stderr = yield* Stream.mkString(Stream.decodeText(handle.stderr)).pipe(Effect.orElseSucceed(() => ""))
        const detail = stderr.trim() || `make exited ${early.value}`
        return fromEnv(env, "off", detail)
      }
      owned = handle
      return fromEnv(env, "on")
    })

    const stop = Effect.fn("MakeDev.stop")(function* () {
      if (!(yield* alive())) {
        owned = undefined
        return yield* status()
      }
      yield* drop()
      return yield* status()
    })

    return Service.of({ status, start, stop })
  }),
)

export const node = makeLocationNode({
  service: Service,
  layer,
  deps: [FSUtil.node, Location.node, AppProcess.node],
})
