import { describe, expect, test } from "bun:test"
import {
  addSecondaryTab,
  closeSecondaryTab,
  emptySecondaryTabs,
  focusSecondaryTab,
  openSecondary,
  openSecondaryFiles,
  secondaryBrowserView,
  secondaryDiffsFromTurn,
  secondaryDiffView,
  secondaryFileBody,
  secondaryFileCrumb,
  secondaryFilesLayout,
  secondaryPathStatus,
  toggleSecondary,
} from "./session-secondary"

describe("secondary tabs", () => {
  test("starts closed with no tabs", () => {
    expect(emptySecondaryTabs()).toEqual({
      opened: false,
      tabs: [],
      nextId: 1,
    })
  })

  test("first open without tabs adds Files", () => {
    const next = openSecondary(emptySecondaryTabs())
    expect(next.opened).toBe(true)
    expect(next.tabs.map((tab) => tab.kind)).toEqual(["files"])
    expect(next.active).toBe(next.tabs[0]?.id)
  })

  test("toggle opens then closes without dropping tabs", () => {
    const opened = toggleSecondary(emptySecondaryTabs())
    expect(opened.opened).toBe(true)
    expect(opened.tabs).toHaveLength(1)
    const closed = toggleSecondary(opened)
    expect(closed.opened).toBe(false)
    expect(closed.tabs).toEqual(opened.tabs)
  })

  test("adding an already-open kind focuses it", () => {
    const files = addSecondaryTab(emptySecondaryTabs(), "files")
    const diff = addSecondaryTab(files, "diff")
    const again = addSecondaryTab(diff, "files")
    expect(again.tabs.map((tab) => tab.kind)).toEqual(["files", "diff"])
    expect(again.active).toBe(files.tabs[0]?.id)
  })

  test("last close shuts the panel", () => {
    const opened = openSecondary(emptySecondaryTabs())
    const closed = closeSecondaryTab(opened, opened.tabs[0]!.id)
    expect(closed.opened).toBe(false)
    expect(closed.tabs).toEqual([])
    expect(closed.active).toBeUndefined()
  })

  test("close of a non-last tab keeps the panel open", () => {
    const files = addSecondaryTab(emptySecondaryTabs(), "files")
    const both = addSecondaryTab(files, "diff")
    const next = closeSecondaryTab(both, files.tabs[0]!.id)
    expect(next.opened).toBe(true)
    expect(next.tabs.map((tab) => tab.kind)).toEqual(["diff"])
    expect(next.active).toBe(both.tabs[1]?.id)
  })

  test("focus selects an existing tab", () => {
    const files = addSecondaryTab(emptySecondaryTabs(), "files")
    const both = addSecondaryTab(files, "browser")
    const focused = focusSecondaryTab(both, files.tabs[0]!.id)
    expect(focused.active).toBe(files.tabs[0]?.id)
    expect(focused.opened).toBe(true)
  })

  test("openFiles opens and focuses Files", () => {
    const next = openSecondaryFiles(addSecondaryTab(emptySecondaryTabs(), "diff"))
    expect(next.opened).toBe(true)
    expect(next.tabs.map((tab) => tab.kind)).toEqual(["diff", "files"])
    expect(next.active).toBe(next.tabs[1]?.id)
  })
})

describe("secondary diffs from turn", () => {
  test("drops diffs without a file", () => {
    expect(
      secondaryDiffsFromTurn([
        { file: "a.ts", additions: 1, deletions: 0, patch: "+a" },
        { additions: 2, deletions: 0, patch: "+b" },
      ]),
    ).toEqual([{ file: "a.ts", additions: 1, deletions: 0, patch: "+a" }])
  })
})

describe("secondary files / diff / browser", () => {
  test("puts the tree to the right of the file", () => {
    expect(secondaryFilesLayout()).toEqual({ treeSide: "right" })
  })

  test("crumb follows the observed path", () => {
    expect(secondaryFileCrumb("docs/product/maquette/cockpit.html")).toBe("docs / product / maquette / cockpit.html")
    expect(secondaryFileCrumb(undefined)).toBe("unknown")
  })

  test("missing or omitted files stay fail-closed", () => {
    expect(secondaryFileBody({})).toBe("unknown")
    expect(secondaryFileBody({ error: true })).toBe("unknown")
    expect(secondaryFileBody({ omitted: true })).toBe("omitted")
    expect(secondaryFileBody({ content: "export const x = 1" })).toBe("export const x = 1")
    expect(secondaryPathStatus("/tmp/outside.ts", "/Users/leanbot/project")).toBe("omitted")
    expect(secondaryPathStatus("src/app.ts", "/Users/leanbot/project")).toBe("in-tree")
  })

  test("empty chat diffs stay empty and a missing patch is unknown", () => {
    expect(secondaryDiffView([])).toEqual({ empty: true, items: [], patch: undefined })
    expect(
      secondaryDiffView(
        [
          { file: "a.ts", additions: 1, deletions: 0, patch: "@@ a.ts\n+ok" },
          { file: "b.ts", additions: 0, deletions: 2 },
        ],
        "b.ts",
      ).patch,
    ).toBe("unknown")
  })

  test("browser stub has about:blank and no iframe", () => {
    expect(secondaryBrowserView()).toEqual({ url: "about:blank", iframe: false })
  })
})
