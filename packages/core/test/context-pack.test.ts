import { describe, expect, test } from "bun:test"
import { resolve } from "path"
import { ContextPack } from "@opencode-ai/core/context-pack"
import { AbsolutePath, RelativePath } from "@opencode-ai/core/schema"
import { Hash } from "@opencode-ai/core/util/hash"
import { Token } from "@opencode-ai/core/util/token"

const worktree = "/tmp/da30-013-worktree"
const staging = "/Users/leanbot/Documents/40_Daidalon/Daidalon/src/secret.ts"
const sibling = "/Users/leanbot/Documents/40_Daidalon/features/tasks/DA30-012/notes.md"
const globalAgents = "/Users/leanbot/.config/opencode/AGENTS.md"

const pack = (input?: Partial<ContextPack.Input>) =>
  ContextPack.assemble({
    mandate: { system: "agent", user: "fix the pack" },
    worktree,
    paths: [{ path: `${worktree}/src/index.ts`, provenance: ["mandate"] }],
    rules: "AGENTS.md rules",
    toolsIdentity: "bash,read,edit",
    ...input,
  })

describe("ContextPack", () => {
  test("keeps files inside the worktree as relative pathset", () => {
    expect(pack().pathset).toEqual([RelativePath.make("src/index.ts")])
    expect(pack().worktree).toBe(AbsolutePath.make(resolve(worktree)))
    expect(pack().omitted).toEqual([])
  })

  test("omits staging, sibling, and global AGENTS.md from the pathset", () => {
    const result = pack({
      paths: [
        { path: `${worktree}/AGENTS.md`, provenance: ["instruction"] },
        { path: staging, provenance: ["staging"] },
        { path: sibling, provenance: ["sibling"] },
        { path: globalAgents, provenance: ["instruction", "global.config"] },
      ],
    })
    expect(result.pathset).toEqual([RelativePath.make("AGENTS.md")])
    expect(result.omitted).toEqual([
      { path: staging, provenance: ["staging"] },
      { path: sibling, provenance: ["sibling"] },
      { path: globalAgents, provenance: ["instruction", "global.config"] },
    ])
  })

  test("unknown tokens have provenance and no value", () => {
    expect(pack().tokensBefore).toEqual({ state: "unknown", provenance: ["Token.estimate"] })
    expect(pack().tokensAfter).toEqual({ state: "unknown", provenance: ["Token.estimate"] })
    expect("value" in pack().tokensBefore).toBe(false)
  })

  test("estimates request tokens with Token.estimate", () => {
    const before = "a".repeat(40)
    const after = "a".repeat(8)
    const result = pack({ requestBefore: before, requestAfter: after })
    expect(result.tokensBefore).toEqual({
      state: "estimated",
      value: { input: Token.estimate(before), output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
      provenance: ["Token.estimate"],
    })
    expect(result.tokensAfter).toMatchObject({
      state: "estimated",
      value: { input: Token.estimate(after) },
    })
    expect(Token.estimate(after)).toBeLessThan(Token.estimate(before))
  })

  test("prompt cache key is stable for cwd + rules + tools and 64 hex chars", () => {
    const first = pack()
    const second = pack()
    const key = ContextPack.promptCacheKey(first.cachePrefix)
    expect(key).toBe(ContextPack.promptCacheKey(second.cachePrefix))
    expect(key).toHaveLength(64)
    expect(first.cachePrefix.rulesHash).toBe(Hash.sha256("AGENTS.md rules"))
  })

  test("prompt cache key changes when cwd, rules, or tools change", () => {
    const base = ContextPack.promptCacheKey(pack().cachePrefix)
    expect(ContextPack.promptCacheKey(pack({ worktree: `${worktree}-other` }).cachePrefix)).not.toBe(base)
    expect(ContextPack.promptCacheKey(pack({ rules: "other rules" }).cachePrefix)).not.toBe(base)
    expect(ContextPack.promptCacheKey(pack({ toolsIdentity: "bash" }).cachePrefix)).not.toBe(base)
  })
})
