import { expect } from "bun:test"
import fs from "fs/promises"
import path from "path"
import { Effect } from "effect"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { TaskAuthority } from "@opencode-ai/core/task-authority"
import { tmpdir } from "./fixture/tmpdir"
import { testEffect } from "./lib/effect"

const it = testEffect(LayerNode.compile(TaskAuthority.node))
const fixture = () =>
  Effect.acquireRelease(Effect.promise(tmpdir), (dir) => Effect.promise(() => dir[Symbol.asyncDispose]()))

const snapshot = (input: { expiresAt?: string; worktree?: string; head?: string; phase?: string } = {}) => ({
  schemaVersion: 2,
  generation: 3,
  authority: { business: "mt-tasks", phasesAndEvidence: "apex-task-folders" },
  observedAt: "2026-09-08T00:00:00.000Z",
  expiresAt: input.expiresAt ?? "2099-09-08T00:00:00.000Z",
  tasks: [
    {
      id: "DA30-008",
      mtStatus: "in_progress",
      apex: { phase: input.phase ?? "build" },
      git: { worktreePath: input.worktree ?? "/repo/worktree", head: input.head ?? "abc123" },
    },
  ],
})

it.live("projects only a fresh, identity-concordant MT/APEX observation", () =>
  Effect.gen(function* () {
    const root = yield* fixture()
    const snapshotPath = path.join(root.path, "CURRENT.json")
    const service = yield* TaskAuthority.Service
    yield* Effect.promise(() => fs.writeFile(snapshotPath, JSON.stringify(snapshot())))
    expect(
      yield* service.observe({ mtTaskID: "DA30-008", worktree: "/repo/worktree", head: "abc123", snapshotPath }),
    ).toMatchObject({ state: "available", mtStatus: "in_progress", apexPhase: "build", generation: 3 })
    expect(
      yield* service.observe({ mtTaskID: "DA30-008", worktree: "/repo/other", head: "abc123", snapshotPath }),
    ).toMatchObject({ state: "divergent" })
    yield* Effect.promise(() =>
      fs.writeFile(snapshotPath, JSON.stringify(snapshot({ expiresAt: "2026-09-08T01:00:00.000Z" }))),
    )
    expect(
      yield* service.observe({ mtTaskID: "DA30-008", worktree: "/repo/worktree", head: "abc123", snapshotPath }),
    ).toMatchObject({ state: "expired" })
  }),
)
