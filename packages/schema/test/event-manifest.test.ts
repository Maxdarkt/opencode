import { describe, expect, test } from "bun:test"
import { FileSystem, Integration, Permission, Project, Reference, Session, Workspace } from "../src"
import { EventManifest } from "../src/event-manifest"
import { IdeEvent } from "../src/ide-event"
import { SessionEvent } from "../src/session-event"
import { SessionTodo } from "../src/session-todo"
import { SessionV1 } from "../src/session-v1"
import { WorkspaceEvent } from "../src/workspace-event"

describe("public event manifest", () => {
  test("owns the complete public event surface", () => {
    expect(EventManifest.ServerDefinitions.map((definition) => definition.type)).toEqual([
      "models-dev.refreshed",
      "integration.updated",
      "integration.connection.updated",
      "catalog.updated",
      "session.created",
      "session.updated",
      "session.deleted",
      "message.updated",
      "message.removed",
      "message.part.updated",
      "message.part.removed",
      "session.next.agent.switched",
      "session.next.model.switched",
      "session.next.moved",
      "session.next.prompted",
      "session.next.prompt.admitted",
      "session.next.context.updated",
      "session.next.synthetic",
      "session.next.shell.started",
      "session.next.shell.ended",
      "session.next.step.started",
      "session.next.step.ended",
      "session.next.step.failed",
      "session.next.text.started",
      "session.next.text.delta",
      "session.next.text.ended",
      "session.next.reasoning.started",
      "session.next.reasoning.delta",
      "session.next.reasoning.ended",
      "session.next.tool.input.started",
      "session.next.tool.input.delta",
      "session.next.tool.input.ended",
      "session.next.tool.called",
      "session.next.tool.progress",
      "session.next.tool.success",
      "session.next.tool.failed",
      "session.next.retried",
      "session.next.compaction.started",
      "session.next.compaction.delta",
      "session.next.compaction.ended",
      "session.next.revert.staged",
      "session.next.revert.cleared",
      "session.next.revert.committed",
      "file.edited",
      "reference.updated",
      "permission.v2.asked",
      "permission.v2.replied",
      "plugin.added",
      "project.directories.updated",
      "file.watcher.updated",
      "pty.created",
      "pty.updated",
      "pty.exited",
      "pty.deleted",
      "question.v2.asked",
      "question.v2.replied",
      "question.v2.rejected",
      "todo.updated",
    ])
    expect(EventManifest.Definitions.length).toBe(88)
    expect(SessionV1.Event.Definitions).toEqual([
      SessionV1.Event.Created,
      SessionV1.Event.Updated,
      SessionV1.Event.Deleted,
      SessionV1.Event.MessageUpdated,
      SessionV1.Event.MessageRemoved,
      SessionV1.Event.PartUpdated,
      SessionV1.Event.PartRemoved,
      SessionV1.Event.PartDelta,
      SessionV1.Event.Diff,
      SessionV1.Event.Error,
    ])
    expect(EventManifest.Latest.size).toBe(88)
    expect(EventManifest.Durable.size).toBe(35)
  })

  test("uses canonical definitions for current public events", () => {
    expect(Session.Event).toBe(SessionEvent)
    expect(Session.Event.Definitions).toBe(SessionEvent.Definitions)
    expect(Workspace.Event).toBe(WorkspaceEvent)
    expect(Workspace.Event.Definitions).toBe(WorkspaceEvent.Definitions)
    expect(EventManifest.Latest.get("session.next.step.ended")).toBe(SessionEvent.Step.Ended)
    expect(EventManifest.Latest.get("todo.updated")).toBe(SessionTodo.Event.Updated)
    expect(EventManifest.Latest.get("project.updated")).toBe(Project.Event.Updated)
    expect(Project.Event.Definitions).toEqual([Project.Event.Updated])
    expect(FileSystem.Event.Definitions).toEqual([FileSystem.Event.Edited])
    expect(Integration.Event.Definitions).toEqual([Integration.Event.Updated, Integration.Event.ConnectionUpdated])
    expect(Permission.Event.Definitions).toEqual([Permission.Event.Asked, Permission.Event.Replied])
    expect(Reference.Event.Definitions).toEqual([Reference.Event.Updated])
    expect(EventManifest.Latest.has("ide.installed")).toBe(false)
    expect(IdeEvent.Definitions).toEqual([IdeEvent.Installed])
    expect(EventManifest.Definitions.slice(43, 46)).toEqual([
      SessionV1.Event.PartDelta,
      SessionV1.Event.Diff,
      SessionV1.Event.Error,
    ])
    expect(EventManifest.Durable.has("session.next.step.ended.1")).toBe(false)
    expect(EventManifest.Durable.get("session.next.step.ended.2")).toBe(SessionEvent.Step.Ended)
  })
})
