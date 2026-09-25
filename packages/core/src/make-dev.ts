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

export type ProcessSampleRow = {
  readonly pid: number
  readonly ppid: number
  readonly cpuPercent: number
  readonly rssKilobytes: number
}

// `ps` reports RSS in kilobytes. Only the owned pid and its descendants count.
export function sumProcessTree(rows: ReadonlyArray<ProcessSampleRow>, rootPid: number) {
  const included = new Set<number>()
  const visit = (pid: number) => {
    if (included.has(pid)) return
    if (!rows.some((row) => row.pid === pid)) return
    included.add(pid)
    for (const row of rows) {
      if (row.ppid === pid) visit(row.pid)
    }
  }
  visit(rootPid)
  if (!included.has(rootPid)) return undefined
  const selected = [...included].flatMap((pid) => {
    const row = rows.find((item) => item.pid === pid)
    return row ? [row] : []
  })
  return {
    cpuPercent: selected.reduce((sum, row) => sum + row.cpuPercent, 0),
    rssBytes: selected.reduce((sum, row) => sum + row.rssKilobytes, 0) * 1024,
  }
}

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
      if (owned) {
        const base = fromEnv(env, env.ok ? "on" : "unknown")
        return yield* attachLoad(base, owned.pid)
      }
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
      return yield* status()
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

const sampleDepth = 8
const samplePidCap = 64

const attachLoad = (status: Status, pid: number) =>
  Effect.gen(function* () {
    if (status.state !== "on") return status
    const sample = yield* Effect.promise(() => readOwnedSample(pid)).pipe(
      Effect.catch(() => Effect.succeed(undefined)),
    )
    if (!sample) return status
    return { ...status, cpuPercent: sample.cpuPercent, rssBytes: sample.rssBytes }
  })

function readOwnedSample(rootPid: number) {
  if (process.platform !== "darwin" && process.platform !== "linux") return Promise.resolve(undefined)
  return collectPids(rootPid).then((pids) => {
    if (!pids) return undefined
    return readPs(pids).then((rows) => {
      if (!rows || rows.length !== pids.length) return undefined
      return sumProcessTree(rows, rootPid)
    })
  })
}

function collectPids(rootPid: number) {
  const all = [rootPid]
  const walk = (frontier: number[], depth: number): Promise<number[] | undefined> => {
    if (depth === sampleDepth) {
      return childrenOf(frontier).then((more) => (more && more.length === 0 ? all : undefined))
    }
    return childrenOf(frontier).then((children) => {
      if (!children) return undefined
      if (children.length === 0) return all
      if (all.length + children.length > samplePidCap) return undefined
      all.push(...children)
      return walk(children, depth + 1)
    })
  }
  return walk([rootPid], 0)
}

function childrenOf(parents: number[]) {
  const found: number[] = []
  const next = (index: number): Promise<number[] | undefined> => {
    const parent = parents[index]
    if (parent === undefined) return Promise.resolve(found)
    return pgrepChildren(parent).then((children) => {
      if (!children) return undefined
      found.push(...children)
      return next(index + 1)
    })
  }
  return next(0)
}

function pgrepChildren(parent: number) {
  return spawnText("pgrep", ["-P", String(parent)]).then((result) => {
    if (!result) return undefined
    if (result.code === 1) return []
    if (result.code !== 0) return undefined
    const pids = result.stdout
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => Number(line))
    if (pids.some((pid) => !Number.isInteger(pid) || pid <= 0)) return undefined
    return pids
  })
}

function readPs(pids: number[]) {
  return spawnText("ps", ["-p", pids.join(","), "-o", "pid=,ppid=,pcpu=,rss="]).then((result) => {
    if (!result || result.code !== 0) return undefined
    return parsePs(result.stdout)
  })
}

function parsePs(text: string) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  const rows = lines.flatMap((line) => {
    const parts = line.split(/\s+/)
    if (parts.length !== 4) return []
    const pid = Number(parts[0])
    const ppid = Number(parts[1])
    const cpuPercent = Number(parts[2])
    const rssKilobytes = Number(parts[3])
    if (!Number.isInteger(pid) || !Number.isInteger(ppid) || !Number.isInteger(rssKilobytes)) return []
    if (!Number.isFinite(cpuPercent) || cpuPercent < 0 || rssKilobytes < 0) return []
    return [{ pid, ppid, cpuPercent, rssKilobytes }]
  })
  if (rows.length !== lines.length) return undefined
  return rows
}

function spawnText(command: string, args: string[]) {
  // LC_ALL=C keeps ps decimals as dots. Replacing env drops PATH, so the parent env stays.
  const proc = Bun.spawn([command, ...args], {
    stdout: "pipe",
    stderr: "ignore",
    env: { ...process.env, LC_ALL: "C", LANG: "C" },
  })
  return new Response(proc.stdout).text().then(async (stdout) => {
    const code = await proc.exited
    return { code, stdout }
  })
}
