import { describe, expect, test } from "bun:test"
import { formatCost, formatTokens, packInspectorView } from "./pack-inspector"

const unknownTokens = { state: "unknown", provenance: ["Token.estimate"] }

describe("packInspectorView", () => {
  test("unknown tokens and missing cost never render as 0", () => {
    const view = packInspectorView({
      pack: {
        worktree: "/tmp/worktree",
        pathset: [],
        omitted: [],
        tokensBefore: unknownTokens,
        tokensAfter: unknownTokens,
      },
    })
    expect(view.tokensBefore).toBe("unknown")
    expect(view.tokensAfter).toBe("unknown")
    expect(view.cost).toBe("unknown")
    expect(view.tokensBefore).not.toBe("0")
    expect(view.cost).not.toBe("0")
    expect(view.cost).not.toBe("$0.00")
    expect(formatTokens(unknownTokens)).toBe("unknown")
    expect(formatTokens({ state: "unknown" })).not.toBe("0")
  })

  test("treats unpublished cost 0 as unknown, not a measured dollar amount", () => {
    expect(formatCost({ state: "measured", value: 0 })).toBe("unknown")
    expect(formatCost({ state: "measured", value: 1.25 })).toBe("1.25")
    expect(formatCost(undefined)).toBe("unknown")
    expect(packInspectorView({ cost: { state: "unknown" } }).cost).toBe("unknown")
  })

  test("keeps an empty pathset and omitted paths without inventing files", () => {
    const view = packInspectorView({
      pack: {
        worktree: "/tmp/worktree",
        pathset: ["src/index.ts"],
        omitted: [{ path: "/tmp/staging/secret.ts" }],
        mandate: { user: "fix the pack" },
        tokensBefore: {
          state: "estimated",
          value: { input: 12, output: 3, reasoning: 0, cache: { read: 0, write: 0 } },
        },
      },
    })
    expect(view.pathset).toEqual(["src/index.ts"])
    expect(view.omitted).toEqual(["/tmp/staging/secret.ts"])
    expect(view.mandate).toBe("fix the pack")
    expect(view.tokensBefore).toBe("15")
  })
})
