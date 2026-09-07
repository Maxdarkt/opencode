import { expect, test } from "bun:test"
import { createOpencodeClient } from "../src/v2/client"

test("sends the explicit inspected directory even when the SDK has another default directory", async () => {
  const requests: Request[] = []
  const client = createOpencodeClient({
    baseUrl: "http://localhost:1234",
    directory: "/default",
    fetch: async (request) => {
      requests.push(request instanceof Request ? request : new Request(request))
      return Response.json({ requested_directory: "/target with spaces" })
    },
  })
  await client.global.context({ directory: "/target with spaces", base_ref: "refs/heads/main", session_id: "ses_test" })
  const url = new URL(requests[0].url)
  expect(requests[0].method).toBe("GET")
  expect(url.pathname).toBe("/global/context")
  expect(url.searchParams.get("directory")).toBe("/target with spaces")
  expect(url.searchParams.get("base_ref")).toBe("refs/heads/main")
  expect(url.searchParams.get("session_id")).toBe("ses_test")
})
