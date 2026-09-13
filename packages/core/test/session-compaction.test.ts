import { expect, test } from "bun:test"
import { DateTime } from "effect"
import { ModelV2 } from "@opencode-ai/core/model"
import { ProviderV2 } from "@opencode-ai/core/provider"
import { SessionCompaction } from "@opencode-ai/core/session/compaction"
import { SessionMessage } from "@opencode-ai/core/session/message"

const created = DateTime.makeUnsafe(0)
const id = (value: string) => SessionMessage.ID.make(`msg_${value}`)

const user = (value: string) =>
  SessionMessage.User.make({
    id: id(value),
    type: "user",
    text: value,
    time: { created },
  })

const assistant = (value: string, name: string, output: string) =>
  SessionMessage.Assistant.make({
    id: id(value),
    type: "assistant",
    agent: "build",
    model: { id: ModelV2.ID.make("model"), providerID: ProviderV2.ID.make("provider") },
    content: [
      SessionMessage.AssistantTool.make({
        type: "tool",
        id: value,
        name,
        state: SessionMessage.ToolStateCompleted.make({
          status: "completed",
          input: {},
          content: [{ type: "text", text: output }],
          structured: {},
        }),
        time: { created },
      }),
    ],
    time: { created, completed: created },
  })

const history = (oldOutput: string, oldName = "bash") => [
  user("one"),
  assistant("old", oldName, oldOutput),
  user("two"),
  assistant("mid", "bash", "mid"),
  user("three"),
  assistant("recent", "bash", "recent"),
]

test("compaction prompt preserves detailed work state and relevant files", () => {
  const prompt = SessionCompaction.buildPrompt({ context: ["conversation history"] })

  expect(prompt).toStartWith(
    "Here is the conversation so far:\n\n<conversation>\nconversation history\n</conversation>",
  )
  expect(prompt.indexOf("</conversation>")).toBeLessThan(prompt.indexOf("Create a new anchored summary"))
  expect(prompt).toContain("conversation history in the <conversation> tags above")
  expect(prompt).toContain("## Work State\n### Completed")
  expect(prompt).toContain("### Active")
  expect(prompt).toContain("### Blocked")
  expect(prompt).toContain("## Relevant Files")
})

test("compaction prompt gives update instructions for a prior summary", () => {
  const prompt = SessionCompaction.buildPrompt({
    context: ["new conversation"],
    previousSummary: "existing summary",
  })

  expect(prompt.indexOf("<conversation>")).toBeLessThan(prompt.indexOf("<prior-summary>"))
  expect(prompt.indexOf("</prior-summary>")).toBeLessThan(prompt.indexOf("The <prior-summary> summarizes"))
  expect(prompt).toContain(
    "Carry forward objectives, constraints, user directives, decisions, and parallel workstreams from the <prior-summary>",
  )
  expect(prompt).toContain('Move completed work from "Active" to "Completed".')
  expect(prompt).toContain('Update "Objective" and "Next Move" to reflect the current work state.')
})

test("compaction describes tool media without embedding base64", () => {
  const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB"
  const serialized = SessionCompaction.serializeToolContent([
    { type: "text", text: "Image read successfully" },
    {
      type: "file",
      uri: `data:image/png;base64,${base64}`,
      mime: "image/png",
      name: "pixel.png",
    },
  ])

  expect(serialized).toBe("Image read successfully\n[Attached image/png: pixel.png]")
  expect(serialized).not.toContain(base64)
})

test("prune truncates old tool output when savings exceed V1 thresholds", () => {
  const messages = history("x".repeat(250_000))
  const pruned = SessionCompaction.prune(messages)
  const old = pruned.messages.find((message) => message.id === id("old"))
  expect(old).toMatchObject({
    type: "assistant",
    content: [
      {
        type: "tool",
        state: { status: "completed", content: [{ type: "text", text: `${"x".repeat(2_000)}\n[truncated]` }] },
      },
    ],
  })
  expect(pruned.tokensAfter).toBeLessThan(pruned.tokensBefore)
  expect(messages[1]).toMatchObject({
    type: "assistant",
    content: [{ type: "tool", state: { content: [{ type: "text", text: "x".repeat(250_000) }] } }],
  })
})

test("prune leaves tool output intact below V1 thresholds", () => {
  const messages = history("small")
  const pruned = SessionCompaction.prune(messages)
  expect(pruned.messages).toBe(messages)
  expect(pruned.tokensAfter).toBe(pruned.tokensBefore)
})

test("prune does not truncate protected skill output", () => {
  const messages = history("x".repeat(250_000), "skill")
  const pruned = SessionCompaction.prune(messages)
  expect(pruned.messages).toBe(messages)
})
