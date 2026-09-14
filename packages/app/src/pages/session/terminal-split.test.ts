import { describe, expect, test } from "bun:test"
import { openTerminalSplit } from "./terminal-split"

describe("openTerminalSplit", () => {
  test("opens two real PTY panes when create succeeds", async () => {
    const created: string[] = []
    const panes = await openTerminalSplit({
      existingIds: ["pty_a"],
      create: async () => {
        created.push("pty_b")
        return "pty_b"
      },
    })
    expect(panes).toEqual([
      { kind: "pty", id: "pty_a" },
      { kind: "pty", id: "pty_b" },
    ])
    expect(created).toEqual(["pty_b"])
  })

  test("marks a pane unknown when create fails instead of faking a shell", async () => {
    const panes = await openTerminalSplit({
      existingIds: ["pty_a"],
      create: async () => undefined,
    })
    expect(panes[0]).toEqual({ kind: "pty", id: "pty_a" })
    expect(panes[1]).toEqual({ kind: "unknown" })
    expect(JSON.stringify(panes)).not.toContain("$")
    expect(JSON.stringify(panes)).not.toContain("shell")
  })

  test("creates both panes when none exist yet", async () => {
    let n = 0
    const panes = await openTerminalSplit({
      existingIds: [],
      create: async () => {
        n += 1
        return `pty_${n}`
      },
    })
    expect(panes).toEqual([
      { kind: "pty", id: "pty_1" },
      { kind: "pty", id: "pty_2" },
    ])
  })
})
