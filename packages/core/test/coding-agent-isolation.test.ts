import { existsSync } from "fs"
import fs from "fs/promises"
import path from "path"
import { describe, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { FileMutation } from "@opencode-ai/core/file-mutation"
import { AppNodeBuilder } from "@opencode-ai/core/effect/app-node-builder"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { FSUtil } from "@opencode-ai/core/fs-util"
import { Location } from "@opencode-ai/core/location"
import { LocationMutation } from "@opencode-ai/core/location-mutation"
import { PermissionV2 } from "@opencode-ai/core/permission"
import { AbsolutePath } from "@opencode-ai/core/schema"
import { SessionV2 } from "@opencode-ai/core/session"
import { ToolRegistry } from "@opencode-ai/core/tool/registry"
import { ToolOutputStore } from "@opencode-ai/core/tool-output-store"
import { WriteTool } from "@opencode-ai/core/tool/write"
import { location } from "./fixture/location"
import { tmpdir } from "./fixture/tmpdir"
import { testEffect } from "./lib/effect"
import { executeTool, toolIdentity } from "./lib/tool"

const SOURCE = "/Users/leanbot/Documents/40_Daidalon/Daidalon"
const TASK_ID = "DA40-017"
const PROBE = "DA40-017-recette-probe.md"
const sessionID = SessionV2.ID.make("ses_coding_agent_isolation")
const assertions: PermissionV2.AssertInput[] = []
const writes: string[] = []
let denyAction: string | undefined

const permission = Layer.succeed(
  PermissionV2.Service,
  PermissionV2.Service.of({
    assert: (input) =>
      Effect.sync(() => assertions.push(input)).pipe(
        Effect.andThen(
          input.action === denyAction ? Effect.fail(new PermissionV2.BlockedError({ rules: [] })) : Effect.void,
        ),
      ),
    ask: () => Effect.die("unused"),
    reply: () => Effect.die("unused"),
    get: () => Effect.die("unused"),
    forSession: () => Effect.die("unused"),
    list: () => Effect.die("unused"),
  }),
)

const reset = () => {
  assertions.length = 0
  writes.length = 0
  denyAction = undefined
}

const filesystem = Layer.effect(
  FSUtil.Service,
  Effect.gen(function* () {
    const fsUtil = yield* FSUtil.Service
    return FSUtil.Service.of({
      ...fsUtil,
      writeWithDirs: (target, content, mode) =>
        Effect.sync(() => writes.push(target)).pipe(Effect.andThen(fsUtil.writeWithDirs(target, content, mode))),
    })
  }),
).pipe(Layer.provide(LayerNode.compile(FSUtil.node)))

const withTool = <A, E, R>(directory: string, body: (registry: ToolRegistry.Interface) => Effect.Effect<A, E, R>) => {
  const activeLocation = Layer.succeed(
    Location.Service,
    Location.Service.of(location({ directory: AbsolutePath.make(directory) })),
  )
  return Effect.gen(function* () {
    return yield* body(yield* ToolRegistry.Service)
  }).pipe(
    Effect.provide(
      AppNodeBuilder.build(
        LayerNode.group([
          ToolRegistry.node,
          ToolRegistry.toolsNode,
          LocationMutation.node,
          FileMutation.node,
          WriteTool.node,
        ]),
        [
          [FSUtil.node, filesystem],
          [Location.node, activeLocation],
          [PermissionV2.node, permission],
          [ToolOutputStore.node, ToolOutputStore.nodeWithoutConfig],
        ],
      ),
    ),
  )
}

const call = (input: typeof WriteTool.Input.Type) => ({
  sessionID,
  ...toolIdentity,
  call: { type: "tool-call" as const, id: "call-write", name: "write", input },
})

const git = async (cwd: string, args: string[]) => {
  const proc = Bun.spawn(["git", ...args], { cwd, stdout: "pipe", stderr: "pipe" })
  const stdout = await new Response(proc.stdout).text()
  const stderr = await new Response(proc.stderr).text()
  const code = await proc.exited
  if (code !== 0) throw new Error(`git ${args.join(" ")} failed: ${stderr || stdout}`)
  return stdout.trim()
}

const fingerprint = async (directory: string) => ({
  head: await git(directory, ["rev-parse", "HEAD"]),
  porcelain: await git(directory, ["status", "--porcelain"]),
})

const initGit = async (directory: string) => {
  await git(directory, ["init"])
  await git(directory, ["config", "core.fsmonitor", "false"])
  await git(directory, ["config", "commit.gpgsign", "false"])
  await git(directory, ["config", "user.email", "test@opencode.test"])
  await git(directory, ["config", "user.name", "Test"])
  await git(directory, ["commit", "--allow-empty", "-m", "root"])
}

const stagingCheckout = async () => {
  if (existsSync(SOURCE)) {
    return { path: SOURCE, dispose: async () => undefined }
  }
  const tmp = await tmpdir()
  const standIn = path.join(tmp.path, "Daidalon")
  await fs.mkdir(standIn)
  await initGit(standIn)
  return { path: standIn, dispose: () => tmp[Symbol.asyncDispose]() }
}

const conventionCard = async () => {
  const tmp = await tmpdir()
  const worktree = path.join(tmp.path, "features", "tasks", TASK_ID)
  await fs.mkdir(worktree, { recursive: true })
  await initGit(worktree)
  return { tmp, worktree }
}

const it = testEffect(Layer.empty)

describe("coding agent isolation recette", () => {
  it.live("writes a relative notes.md only inside the card convention tree", () =>
    Effect.acquireUseRelease(
      Effect.promise(async () => {
        const card = await conventionCard()
        const staging = await stagingCheckout()
        return { card, staging, before: await fingerprint(staging.path) }
      }),
      (env) => {
        reset()
        return withTool(env.card.worktree, (registry) =>
          Effect.gen(function* () {
            const result = yield* executeTool(registry, call({ path: "notes.md", content: "isolated" }))
            expect(result).toEqual({ type: "text", value: "Created file successfully: notes.md" })
            expect(yield* Effect.promise(() => fs.readFile(path.join(env.card.worktree, "notes.md"), "utf8"))).toBe(
              "isolated",
            )
            expect(existsSync(path.join(env.staging.path, "notes.md"))).toBe(false)
            expect(yield* Effect.promise(() => fingerprint(env.staging.path))).toEqual(env.before)
          }),
        )
      },
      (env) =>
        Effect.promise(async () => {
          await env.card.tmp[Symbol.asyncDispose]()
          await env.staging.dispose()
        }),
    ),
  )

  it.live("rejects a relative escape without writing outside the Location", () =>
    Effect.acquireUseRelease(
      Effect.promise(async () => {
        const card = await conventionCard()
        const staging = await stagingCheckout()
        return { card, staging, before: await fingerprint(staging.path) }
      }),
      (env) => {
        reset()
        return withTool(env.card.worktree, (registry) =>
          Effect.gen(function* () {
            const escaped = path.join(env.card.worktree, "..", "escape.md")
            const result = yield* executeTool(registry, call({ path: "../escape.md", content: "escaped" }))
            expect(result).toEqual({ type: "error", value: "Unable to write ../escape.md" })
            expect(existsSync(escaped)).toBe(false)
            expect(writes).toEqual([])
            expect(yield* Effect.promise(() => fingerprint(env.staging.path))).toEqual(env.before)
          }),
        )
      },
      (env) =>
        Effect.promise(async () => {
          await env.card.tmp[Symbol.asyncDispose]()
          await env.staging.dispose()
        }),
    ),
  )

  it.live("denies an absolute write under staging and keeps the fingerprint", () =>
    Effect.acquireUseRelease(
      Effect.promise(async () => {
        const card = await conventionCard()
        const staging = await stagingCheckout()
        return { card, staging, before: await fingerprint(staging.path) }
      }),
      (env) => {
        reset()
        denyAction = "external_directory"
        const probe = path.join(env.staging.path, PROBE)
        return withTool(env.card.worktree, (registry) =>
          Effect.gen(function* () {
            const result = yield* executeTool(registry, call({ path: probe, content: "staging" }))
            expect(result).toEqual({ type: "error", value: `Unable to write ${probe}` })
            expect(assertions.map((input) => input.action)).toEqual(["external_directory"])
            expect(writes).toEqual([])
            expect(existsSync(probe)).toBe(false)
            expect(yield* Effect.promise(() => fingerprint(env.staging.path))).toEqual(env.before)
          }),
        )
      },
      (env) =>
        Effect.promise(async () => {
          await env.card.tmp[Symbol.asyncDispose]()
          await env.staging.dispose()
        }),
    ),
  )
})
