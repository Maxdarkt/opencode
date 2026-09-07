import { describe, expect, test } from "bun:test"
import { homeNewSessionDirectory, projectForHomeDirectory } from "./home-controller"

const project = {
  worktree: "/repo/main",
  sandboxes: ["/repo/worktree-a", "/repo/worktree-b"],
}

describe("home new-session worktree routing", () => {
  test("recognizes a selected linked worktree as part of its project", () => {
    expect(projectForHomeDirectory([project], "/repo/worktree-b")).toBe(project)
  })

  test("keeps the exact selected linked worktree when creating a draft", () => {
    expect(homeNewSessionDirectory(project, "/repo/worktree-b")).toBe("/repo/worktree-b")
  })

  test("falls back to the project root for an unrelated or absent selection", () => {
    expect(homeNewSessionDirectory(project, "/other")).toBe("/repo/main")
    expect(homeNewSessionDirectory(project)).toBe("/repo/main")
  })
})
