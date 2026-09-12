import { expect } from "bun:test"
import { execFile } from "child_process"
import fs from "fs/promises"
import path from "path"
import { promisify } from "util"
import { Effect, Layer } from "effect"
import { AppNodeBuilder } from "@opencode-ai/core/effect/app-node-builder"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { Location } from "@opencode-ai/core/location"
import { ProjectV2 } from "@opencode-ai/core/project"
import { RepositoryTopology } from "@opencode-ai/core/repository-topology"
import { AbsolutePath } from "@opencode-ai/core/schema"
import { SessionSchema } from "@opencode-ai/core/session/schema"
import { TaskBinding } from "@opencode-ai/core/task-binding"
import { TaskOwnership } from "@opencode-ai/schema/task-ownership"
import { gitRemote } from "./fixture/git"
import { tmpdir } from "./fixture/tmpdir"
import { testEffect } from "./lib/effect"

const exec = promisify(execFile)

const recorded: Array<{ cwd: string; args: ReadonlyArray<string> }> = []

const spyGit = Layer.succeed(
  RepositoryTopology.GitRunner,
  RepositoryTopology.GitRunner.of({
    run: (cwd, args) => {
      recorded.push({ cwd, args: [...args] })
      return RepositoryTopology.runAllowedGit(cwd, args)
    },
  }),
)

const it = testEffect(
  AppNodeBuilder.build(LayerNode.group([RepositoryTopology.node]), [
    [RepositoryTopology.node, RepositoryTopology.layerFromGit.pipe(Layer.provide(spyGit))],
  ]),
)

const fixture = () =>
  Effect.acquireRelease(Effect.promise(tmpdir), (dir) => Effect.promise(() => dir[Symbol.asyncDispose]()))

const unknownFact = (reference: string) => ({
  state: "unknown" as const,
  provenance: TaskOwnership.Provenance.make({ source: "task_binding", reference }),
  freshness: TaskOwnership.Freshness.make({}),
})

const emptyOwnership = () =>
  TaskOwnership.Snapshot.make({
    state: "absent",
    provenance: TaskOwnership.Provenance.make({ source: "task_binding", reference: "none" }),
    freshness: TaskOwnership.Freshness.make({}),
    result: { kind: "complete" },
    entries: [],
  })

const identity = (taskID: string, checkout: TaskBinding.Checkout) =>
  TaskBinding.Identity.make({
    mtTaskID: taskID,
    apexExternalRef: `.project/tasks/${taskID}`,
    sessionID: SessionSchema.ID.make(`ses_${taskID.toLowerCase().replace(/[^a-z0-9]/g, "")}`),
    projectID: ProjectV2.ID.make(`project-${taskID}`),
    location: Location.Ref.make({ directory: checkout.worktree }),
    checkout,
  })

const ownershipEntry = (taskID: string, checkout: TaskBinding.Checkout) =>
  TaskOwnership.Entry.make({
    identity: identity(taskID, checkout),
    binding: unknownFact(taskID),
    authority: unknownFact(taskID),
    execution: unknownFact(taskID),
    attention: unknownFact(taskID),
  })

const ownershipOf = (entries: ReadonlyArray<TaskOwnership.Entry>) =>
  TaskOwnership.Snapshot.make({
    state: "available",
    provenance: TaskOwnership.Provenance.make({ source: "task_binding", reference: "fixture" }),
    freshness: TaskOwnership.Freshness.make({}),
    result: { kind: "complete" },
    entries,
  })

const revParse = (cwd: string) =>
  exec("git", ["rev-parse", "HEAD"], { cwd }).then((result) => result.stdout.trim())

const branchName = (cwd: string) =>
  exec("git", ["symbolic-ref", "--short", "HEAD"], { cwd }).then((result) => result.stdout.trim())

const checkoutAt = (root: string, worktree: string) =>
  Effect.promise(async () => {
    const [head, branch] = await Promise.all([revParse(worktree), branchName(worktree)])
    return TaskBinding.Checkout.make({
      repository: AbsolutePath.make(root),
      branch,
      worktree: AbsolutePath.make(worktree),
      head,
    })
  })

type Twin = {
  source: string
  wtA: string
  wtB: string
}

const twinWorktrees = (root: string) =>
  Effect.promise(async (): Promise<Twin> => {
    const remote = await gitRemote(root)
    const wtA = path.join(root, "wt-a")
    const wtB = path.join(root, "wt-b")
    await exec("git", ["worktree", "add", "-b", "task-a", wtA], { cwd: remote.source })
    await exec("git", ["worktree", "add", "-b", "task-b", wtB], { cwd: remote.source })
    await fs.writeFile(path.join(wtA, "README.md"), "task-a ahead\n")
    await exec("git", ["add", "README.md"], { cwd: wtA })
    await exec("git", ["commit", "-m", "ahead-a"], { cwd: wtA })
    await fs.appendFile(path.join(wtB, "README.md"), "dirty-b\n")
    return { source: remote.source, wtA, wtB }
  })

const read = (input: RepositoryTopology.Input) =>
  RepositoryTopology.Service.use((service) => service.read(input))

const byPath = (worktrees: ReadonlyArray<RepositoryTopology.Worktree>, expected: string) =>
  worktrees.find((worktree) => worktree.path.state === "available" && worktree.path.value === expected)

const mutativeArgv = [
  ["commit", "-m", "x"],
  ["checkout", "main"],
  ["push"],
  ["pull"],
  ["merge", "main"],
  ["rebase", "main"],
  ["reset", "--hard"],
  ["add", "."],
  ["worktree", "add", "/tmp/x"],
  ["worktree", "prune"],
  ["worktree", "remove", "/tmp/x"],
  ["clean", "-fd"],
] as const

it.live("re-exports the canonical Schema contracts", () =>
  Effect.gen(function* () {
    const schema = yield* Effect.promise(() => import("@opencode-ai/schema/repository-topology"))
    expect(RepositoryTopology.Service).toBeDefined()
    expect(schema.RepositoryTopology.Snapshot).toBeDefined()
  }),
)

it.live("rejects mutative git argv on the allowlist", () =>
  Effect.sync(() => {
    for (const args of mutativeArgv) {
      expect(RepositoryTopology.isAllowedGitArgs(args)).toBe(false)
    }
    expect(RepositoryTopology.isAllowedGitArgs(["worktree", "list", "--porcelain"])).toBe(true)
  }),
)

it.live("lists isolated A/B worktrees and links matching ownership only", () =>
  Effect.gen(function* () {
    recorded.length = 0
    const root = yield* fixture()
    const twin = yield* twinWorktrees(root.path)
    const checkoutA = yield* checkoutAt(twin.source, twin.wtA)
    const checkoutB = yield* checkoutAt(twin.source, twin.wtB)
    const snapshot = yield* read({
      ownership: ownershipOf([ownershipEntry("DA20-005-A", checkoutA), ownershipEntry("DA20-005-B", checkoutB)]),
      repositories: [{ root: twin.source, sourceRefs: ["main", "task-a", "task-b", "missing-ref"], mergeTarget: "main" }],
    })
    expect(snapshot.state).toBe("available")
    const repo = snapshot.repositories[0]
    expect(repo.sourceRepo.state).toBe("available")
    const names = repo.branches.map((branch) => [branch.name, branch.presence.state, "value" in branch.presence ? branch.presence.value : undefined])
    expect(names).toEqual([
      ["main", "available", "present"],
      ["task-a", "available", "present"],
      ["task-b", "available", "present"],
      ["missing-ref", "absent", undefined],
    ])
    const a = byPath(repo.worktrees, twin.wtA)
    const b = byPath(repo.worktrees, twin.wtB)
    expect(a?.task).toMatchObject({ state: "available", value: { mtTaskID: "DA20-005-A" } })
    expect(b?.task).toMatchObject({ state: "available", value: { mtTaskID: "DA20-005-B" } })
    expect(a?.ahead).toMatchObject({ state: "available", value: 1 })
    expect(b?.cleanliness).toMatchObject({ state: "available", value: "modified" })
    expect(a?.workingTreeDiff.state).toBe("available")
    expect(a?.integrationDiff.state).toBe("available")
    expect(a?.workingTreeDiff.state === "available" && b?.integrationDiff.state === "available").toBe(true)
    if (a?.workingTreeDiff.state === "available" && a.integrationDiff.state === "available") {
      expect(a.workingTreeDiff.value).not.toEqual(a.integrationDiff.value)
    }
  }),
)

it.live("lists worktrees without mtTaskID when ownership identity is absent", () =>
  Effect.gen(function* () {
    recorded.length = 0
    const root = yield* fixture()
    const twin = yield* twinWorktrees(root.path)
    const snapshot = yield* read({
      ownership: emptyOwnership(),
      repositories: [{ root: twin.source, sourceRefs: ["main"], mergeTarget: "main" }],
    })
    const listed = snapshot.repositories[0].worktrees.filter(
      (worktree) => worktree.path.state === "available" && (worktree.path.value === twin.wtA || worktree.path.value === twin.wtB),
    )
    expect(listed.length).toBe(2)
    for (const worktree of listed) {
      expect(worktree.task.state).toBe("absent")
      expect("value" in worktree.task).toBe(false)
    }
  }),
)

it.live("marks empty mergeTarget invalid without rev-list", () =>
  Effect.gen(function* () {
    recorded.length = 0
    const root = yield* fixture()
    const twin = yield* twinWorktrees(root.path)
    const snapshot = yield* read({
      ownership: emptyOwnership(),
      repositories: [{ root: twin.source, sourceRefs: ["main"], mergeTarget: "" }],
    })
    const a = byPath(snapshot.repositories[0].worktrees, twin.wtA)
    expect(a?.mergeTarget.state).toBe("invalid")
    expect(a?.ahead.state).toBe("invalid")
    expect(a?.behind.state).toBe("invalid")
    expect(a?.integrationDiff.state).toBe("invalid")
    expect(recorded.some((call) => call.args[0] === "rev-list")).toBe(false)
  }),
)

it.live("marks a dead mergeTarget unknown/absent without substituting staging or dev", () =>
  Effect.gen(function* () {
    recorded.length = 0
    const root = yield* fixture()
    const twin = yield* twinWorktrees(root.path)
    const snapshot = yield* read({
      ownership: emptyOwnership(),
      repositories: [{ root: twin.source, sourceRefs: ["main"], mergeTarget: "dead-merge-target" }],
    })
    const a = byPath(snapshot.repositories[0].worktrees, twin.wtA)
    expect(a?.mergeTarget.state === "absent" || a?.mergeTarget.state === "unknown").toBe(true)
    expect(a?.ahead.state).toBe("unknown")
    expect(a?.behind.state).toBe("unknown")
    expect(a?.integrationDiff.state).toBe("unknown")
    expect(recorded.some((call) => call.args.includes("staging") || call.args.includes("dev"))).toBe(false)
  }),
)

it.live("reads prunable without pruning and records no mutative argv", () =>
  Effect.gen(function* () {
    recorded.length = 0
    const root = yield* fixture()
    const twin = yield* twinWorktrees(root.path)
    const wtP = path.join(root.path, "wt-p")
    yield* Effect.promise(() => exec("git", ["worktree", "add", "-b", "task-p", wtP], { cwd: twin.source }))
    yield* Effect.promise(() => fs.rm(wtP, { recursive: true, force: true }))
    recorded.length = 0
    const snapshot = yield* read({
      ownership: emptyOwnership(),
      repositories: [{ root: twin.source, sourceRefs: ["task-p"], mergeTarget: "main" }],
    })
    const prunable = snapshot.repositories[0].worktrees.find(
      (worktree) => worktree.path.state === "available" && worktree.path.value === wtP,
    )
    expect(prunable?.prunable).toMatchObject({ state: "available", value: true })
    expect(recorded.some((call) => call.args[1] === "prune" || call.args[1] === "add" || call.args[1] === "remove")).toBe(
      false,
    )
    for (const call of recorded) {
      expect(RepositoryTopology.isAllowedGitArgs(call.args)).toBe(true)
      expect(mutativeArgv.some((args) => args[0] === call.args[0] && args[1] === call.args[1])).toBe(false)
    }
  }),
)

it.live("marks ownership divergent when checkout disagrees with the measured worktree", () =>
  Effect.gen(function* () {
    recorded.length = 0
    const root = yield* fixture()
    const twin = yield* twinWorktrees(root.path)
    const checkoutA = yield* checkoutAt(twin.source, twin.wtA)
    const stale = TaskBinding.Checkout.make({
      repository: checkoutA.repository,
      branch: checkoutA.branch,
      worktree: checkoutA.worktree,
      head: "0".repeat(40),
    })
    const snapshot = yield* read({
      ownership: ownershipOf([ownershipEntry("DA20-005-A", stale)]),
      repositories: [{ root: twin.source, sourceRefs: ["task-a"], mergeTarget: "main" }],
    })
    const a = byPath(snapshot.repositories[0].worktrees, twin.wtA)
    expect(a?.task.state).toBe("divergent")
    expect("value" in (a?.task ?? {})).toBe(false)
  }),
)

it.live("marks two identities on the same worktree invalid", () =>
  Effect.gen(function* () {
    recorded.length = 0
    const root = yield* fixture()
    const twin = yield* twinWorktrees(root.path)
    const checkoutA = yield* checkoutAt(twin.source, twin.wtA)
    const snapshot = yield* read({
      ownership: ownershipOf([ownershipEntry("DA20-005-A", checkoutA), ownershipEntry("DA20-005-B", checkoutA)]),
      repositories: [{ root: twin.source, sourceRefs: ["task-a"], mergeTarget: "main" }],
    })
    const a = byPath(snapshot.repositories[0].worktrees, twin.wtA)
    expect(a?.task.state).toBe("invalid")
    expect("value" in (a?.task ?? {})).toBe(false)
  }),
)
