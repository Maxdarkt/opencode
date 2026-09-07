import { expect, test } from "bun:test"
import { createProjectOpening } from "./project-opening"

function deferred<T>() {
  return Promise.withResolvers<T>()
}

function fixture(read: (server: string, directory: string) => Promise<string>) {
  const events: string[] = []
  return {
    events,
    opening: createProjectOpening({
      read,
      commit: (server, directory, project) => events.push(`open:${server}:${directory}:${project}`),
      select: (server, directory) => events.push(`select:${server}:${directory}`),
      error: (server, directory) => events.push(`error:${server}:${directory}`),
    }),
  }
}

test("waits for the real project before opening and selecting an empty directory", async () => {
  const result = deferred<string>()
  const { opening, events } = fixture(() => result.promise)
  const pending = opening.open("api", ["/empty"])
  expect(events).toEqual([])
  result.resolve("non-git")
  await pending
  expect(events).toEqual(["open:api:/empty:non-git", "select:api:/empty"])
})

test("failed requests are visible and never announce a successful opening", async () => {
  const { opening, events } = fixture(async () => {
    throw new Error("401")
  })
  await opening.open("api", ["/repo"])
  expect(events).toEqual(["error:api:/repo"])
})

test("a later server selection suppresses an obsolete response", async () => {
  const first = deferred<string>()
  const { opening, events } = fixture((server) => (server === "old" ? first.promise : Promise.resolve("new")))
  const pending = opening.open("old", ["/repo"])
  await opening.open("new", ["/repo"])
  first.resolve("old")
  await pending
  expect(events).toEqual(["open:new:/repo:new", "select:new:/repo"])
})

test("cancel and disposal suppress late success and error", async () => {
  for (const fail of [false, true]) {
    const result = deferred<string>()
    const { opening, events } = fixture(() => result.promise)
    const pending = opening.open("api", ["/repo"])
    opening.cancel()
    if (fail) result.reject(new Error("network"))
    if (!fail) result.resolve("project")
    await pending
    expect(events).toEqual([])
  }
})

test("picker cancellation with no directories invalidates pending opening", async () => {
  const result = deferred<string>()
  const { opening, events } = fixture(() => result.promise)
  const pending = opening.open("api", ["/repo"])
  await opening.open("api", [])
  result.resolve("project")
  await pending
  expect(events).toEqual([])
})

test("deduplicates directories and selects the first successful result", async () => {
  const { opening, events } = fixture(async (_server, directory) => {
    if (directory === "/absent") throw new Error("absent")
    return "project"
  })
  await opening.open("api", ["/absent", "/ok", "/ok", ""])
  expect(events).toEqual(["error:api:/absent", "open:api:/ok:project", "select:api:/ok"])
})
