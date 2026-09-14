import { existsSync } from "fs"
import { afterEach, describe, expect, mock } from "bun:test"
import { execFile } from "child_process"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { promisify } from "util"
import { AppNodeBuilder } from "@opencode-ai/core/effect/app-node-builder"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { CrossSpawnSpawner } from "@opencode-ai/core/cross-spawn-spawner"
import { Effect, Layer } from "effect"
import { Session as SessionNs } from "@/session/session"
import { disposeAllInstances, tmpdir } from "../fixture/fixture"
import { pollWithTimeout, testEffect } from "../lib/effect"
import { TestLLMServer } from "../lib/llm-server"
import { httpApiLayer, request, requestInDirectory } from "./httpapi-layer"
import { GlobalPaths } from "../../src/server/routes/instance/httpapi/groups/global"

const exec = promisify(execFile)
const TASK_ID = "DA40-017"
const SOURCE = "/Users/leanbot/Documents/40_Daidalon/Daidalon"

const it = testEffect(Layer.mergeAll(LayerNode.compile(SessionNs.node), httpApiLayer))

afterEach(async () => {
  mock.restore()
  await disposeAllInstances()
})

const openPayload = (worktree: string) => ({
  mtTaskID: TASK_ID,
  apexExternalRef: `.project/tasks/${TASK_ID}-recette-agentique`,
  worktree,
})

const conventionTree = (config?: Record<string, unknown>) =>
  Effect.acquireRelease(
    Effect.promise(async () => {
      const tmp = await tmpdir()
      const worktree = path.join(tmp.path, "features", "tasks", TASK_ID)
      await mkdir(worktree, { recursive: true })
      await exec("git", ["init"], { cwd: worktree })
      await exec("git", ["config", "core.fsmonitor", "false"], { cwd: worktree })
      await exec("git", ["config", "commit.gpgsign", "false"], { cwd: worktree })
      await exec("git", ["config", "user.email", "test@opencode.test"], { cwd: worktree })
      await exec("git", ["config", "user.name", "Test"], { cwd: worktree })
      await exec("git", ["commit", "--allow-empty", "-m", "root"], { cwd: worktree })
      await exec("git", ["branch", "-M", "chat-worktree"], { cwd: worktree })
      if (config) {
        await writeFile(path.join(worktree, "opencode.json"), JSON.stringify({ $schema: "https://opencode.ai/config.json", ...config }))
      }
      return { tmp, worktree }
    }),
    (dir) => Effect.promise(() => dir.tmp[Symbol.asyncDispose]()),
  )

const openCard = (worktree: string) =>
  request(GlobalPaths.taskChatOpen, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(openPayload(worktree)),
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

const stagingSnapshot = async () => {
  if (!existsSync(SOURCE)) return
  return fingerprint(SOURCE)
}

const sessionActive = (sessionID: string) =>
  request("/api/session/active").pipe(
    Effect.flatMap((response) => response.json),
    Effect.map((body) => {
      const data = (body as { data: Record<string, unknown> }).data
      if (data[sessionID] === undefined) return
      return data[sessionID]
    }),
  )

describe("coding agent recette", () => {
  it.live("opens a convention card then returns an honest pack", () =>
    Effect.gen(function* () {
      const tree = yield* conventionTree()
      const opened = yield* openCard(tree.worktree)
      expect(opened.status).toBe(200)
      const openedBody = (yield* opened.json) as { sessionID: string; created: boolean }
      expect(openedBody.created).toBe(true)
      expect(openedBody.sessionID).toBeTruthy()

      const pack = yield* requestInDirectory(`/api/session/${openedBody.sessionID}/pack`, tree.worktree)
      expect(pack.status).toBe(200)
      const result = (yield* pack.json) as {
        data: {
          worktree: string
          tokensBefore: { state: string }
          tokensAfter: { state: string }
        }
      }
      expect(result.data.worktree).toBe(path.resolve(tree.worktree))
      expect(result.data.tokensBefore.state).toBe("unknown")
      expect(result.data.tokensAfter.state).toBe("unknown")
      expect("value" in result.data.tokensBefore).toBe(false)
      expect("value" in result.data.tokensAfter).toBe(false)

      yield* Effect.promise(() => writeFile(path.join(tree.worktree, "notes.md"), "isolated"))
      const afterWrite = yield* requestInDirectory(`/api/session/${openedBody.sessionID}/pack`, tree.worktree)
      expect(afterWrite.status).toBe(200)
      const again = (yield* afterWrite.json) as {
        data: {
          worktree: string
          tokensBefore: { state: string }
          tokensAfter: { state: string }
        }
      }
      expect(again.data.worktree).toBe(path.resolve(tree.worktree))
      expect(again.data.tokensBefore.state).toBe("unknown")
      expect(again.data.tokensAfter.state).toBe("unknown")
      expect("value" in again.data.tokensBefore).toBe(false)
      expect(again.data.tokensBefore.state).not.toBe("0")
    }),
  )

  it.live("interrupts an idle opened session as a no-op", () =>
    Effect.gen(function* () {
      const tree = yield* conventionTree()
      const opened = yield* openCard(tree.worktree)
      expect(opened.status).toBe(200)
      const openedBody = (yield* opened.json) as { sessionID: string }
      const interrupt = yield* requestInDirectory(`/api/session/${openedBody.sessionID}/interrupt`, tree.worktree, {
        method: "POST",
      })
      expect(interrupt.status).toBe(204)
      expect(yield* sessionActive(openedBody.sessionID)).toBeUndefined()
    }),
  )

  it.live("interrupts a hung mock drain over HTTP without touching staging", () =>
    Effect.gen(function* () {
      const llm = yield* TestLLMServer
      const tree = yield* conventionTree({
        model: "test/test-model",
        formatter: false,
        lsp: false,
        providers: {
          test: {
            name: "Test",
            api: {
              type: "aisdk",
              package: "@ai-sdk/openai-compatible",
              url: llm.url,
              settings: {},
            },
            request: { body: { apiKey: "test-key" } },
            models: {
              "test-model": {
                name: "Test Model",
                api: {
                  type: "aisdk",
                  package: "@ai-sdk/openai-compatible",
                  url: llm.url,
                  id: "test-model",
                  settings: {},
                },
                capabilities: { tools: true, input: ["text"], output: ["text"] },
              },
            },
          },
        },
      })
      const before = yield* Effect.promise(() => stagingSnapshot())
      const opened = yield* openCard(tree.worktree)
      expect(opened.status).toBe(200)
      const openedBody = (yield* opened.json) as { sessionID: string }
      const switched = yield* requestInDirectory(`/api/session/${openedBody.sessionID}/model`, tree.worktree, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: { providerID: "test", id: "test-model" } }),
      })
      expect(switched.status).toBe(204)
      yield* pollWithTimeout(
        requestInDirectory(`/api/session/${openedBody.sessionID}`, tree.worktree).pipe(
          Effect.flatMap((response) => response.json),
          Effect.map((body) => {
            const model = (body as { data: { model?: { id: string } } }).data.model
            if (model?.id !== "test-model") return
            return model
          }),
        ),
        "model switch was not projected",
        "10 seconds",
      )
      yield* llm.hang
      const prompted = yield* requestInDirectory(`/api/session/${openedBody.sessionID}/prompt`, tree.worktree, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: { text: "hang" } }),
      })
      expect(prompted.status).toBe(200)
      yield* pollWithTimeout(
        llm.calls.pipe(Effect.map((count) => (count >= 1 ? count : undefined))),
        "mock LLM was never called after v2 prompt",
        "20 seconds",
      )
      yield* pollWithTimeout(sessionActive(openedBody.sessionID), "timed out waiting for busy drain", "15 seconds")
      if (before) expect(yield* Effect.promise(() => fingerprint(SOURCE))).toEqual(before)
      const interrupt = yield* requestInDirectory(`/api/session/${openedBody.sessionID}/interrupt`, tree.worktree, {
        method: "POST",
      })
      expect(interrupt.status).toBe(204)
      yield* pollWithTimeout(
        sessionActive(openedBody.sessionID).pipe(
          Effect.map((active) => (active === undefined ? true : undefined)),
        ),
        "timed out waiting for interrupt to clear the drain",
        "15 seconds",
      )
      if (before) expect(yield* Effect.promise(() => fingerprint(SOURCE))).toEqual(before)
    }).pipe(Effect.provide(TestLLMServer.layer), Effect.provide(AppNodeBuilder.build(CrossSpawnSpawner.node))),
    { timeout: 45000 },
  )
})
