export * as RepositoryTopology from "./repository-topology"

import path from "path"
import { Context, Effect, Layer } from "effect"
import { RepositoryTopology } from "@opencode-ai/schema/repository-topology"
import { TaskOwnership } from "@opencode-ai/schema/task-ownership"
import { makeGlobalNode } from "./effect/app-node"

export const State = RepositoryTopology.State
export type State = RepositoryTopology.State

export const Unavailable = RepositoryTopology.Unavailable
export type Unavailable = RepositoryTopology.Unavailable

export const Source = RepositoryTopology.Source
export type Source = RepositoryTopology.Source

export const Provenance = RepositoryTopology.Provenance
export type Provenance = RepositoryTopology.Provenance

export const Freshness = RepositoryTopology.Freshness
export type Freshness = RepositoryTopology.Freshness

export const Input = RepositoryTopology.Input
export type Input = RepositoryTopology.Input

export const Snapshot = RepositoryTopology.Snapshot
export type Snapshot = RepositoryTopology.Snapshot

export const Worktree = RepositoryTopology.Worktree
export type Worktree = RepositoryTopology.Worktree

export interface GitResult {
  readonly ok: boolean
  readonly stdout: string
  readonly stderr: string
  readonly exitCode: number
}

export interface GitRunnerApi {
  readonly run: (cwd: string, args: ReadonlyArray<string>) => Effect.Effect<GitResult>
}

export class GitRunner extends Context.Service<GitRunner, GitRunnerApi>()("@opencode/RepositoryTopologyGit") {}

export interface Interface {
  readonly read: (input: Input) => Effect.Effect<Snapshot>
}

export class Service extends Context.Service<Service, Interface>()("@opencode/RepositoryTopology") {}

const failedGit = { ok: false, stdout: "", stderr: "inaccessible", exitCode: 1 } as const

const freshness = (observedAt: string) => RepositoryTopology.Freshness.make({ observedAt })

const provenance = (source: Source, reference: string) =>
  RepositoryTopology.Provenance.make({ source, reference })

const missing = (state: Unavailable, source: Source, reference: string, observedAt: string) => ({
  state,
  provenance: provenance(source, reference),
  freshness: freshness(observedAt),
})

const available = <V>(value: V, source: Source, reference: string, observedAt: string) => ({
  state: "available" as const,
  value,
  provenance: provenance(source, reference),
  freshness: freshness(observedAt),
})

const isSafeRef = (value: string) => {
  if (value.length === 0) return false
  if (value.startsWith("-")) return false
  if (value.includes("\0") || /\s/.test(value)) return false
  return true
}

const isSafeTripleDotHead = (value: string) => {
  if (!value.endsWith("...HEAD")) return false
  return isSafeRef(value.slice(0, -"...HEAD".length))
}

export const isAllowedGitArgs = (args: ReadonlyArray<string>) => {
  if (args[0] === "worktree" && args[1] === "list" && args[2] === "--porcelain" && args.length === 3) return true
  if (args[0] === "rev-parse" && args[1] === "--show-toplevel" && args.length === 2) return true
  if (args[0] === "rev-parse" && args[1] === "--git-common-dir" && args.length === 2) return true
  if (args[0] === "rev-parse" && args[1] === "--verify" && args.length === 3 && isSafeRef(args[2])) return true
  if (
    args[0] === "symbolic-ref" &&
    args[1] === "--quiet" &&
    args[2] === "--short" &&
    args[3] === "HEAD" &&
    args.length === 4
  )
    return true
  if (
    args[0] === "status" &&
    args[1] === "--porcelain=v1" &&
    args[2] === "--untracked-files=all" &&
    args[3] === "--no-renames" &&
    args.length === 4
  )
    return true
  if (
    args[0] === "rev-list" &&
    args[1] === "--left-right" &&
    args[2] === "--count" &&
    args.length === 4 &&
    isSafeTripleDotHead(args[3])
  )
    return true
  if (
    args[0] === "diff" &&
    args[1] === "--no-ext-diff" &&
    args[2] === "--no-renames" &&
    args[3] === "--numstat" &&
    args.length === 5 &&
    (args[4] === "HEAD" || isSafeTripleDotHead(args[4]))
  )
    return true
  if (args[0] === "show-ref" && args[1] === "--verify" && args.length === 3 && isSafeRef(args[2])) return true
  if (args[0] === "for-each-ref" && args[1] === "--format=%(refname)" && args.length === 3 && isSafeRef(args[2]))
    return true
  return false
}

const spawnGit = (cwd: string, args: ReadonlyArray<string>) =>
  Effect.tryPromise(async () => {
    const proc = Bun.spawn(["git", ...args], { cwd, stdout: "pipe", stderr: "pipe" })
    const stdout = await new Response(proc.stdout).text()
    const stderr = await new Response(proc.stderr).text()
    const exitCode = await proc.exited
    return { ok: exitCode === 0, stdout, stderr, exitCode }
  }).pipe(Effect.orElseSucceed(() => failedGit))

export const runAllowedGit = (cwd: string, args: ReadonlyArray<string>) => {
  if (!isAllowedGitArgs(args)) return Effect.succeed(failedGit)
  return spawnGit(cwd, args)
}

export const gitLayer = Layer.succeed(GitRunner, GitRunner.of({ run: runAllowedGit }))

const normalizePath = (value: string) => path.normalize(value.replace(/\/+$/, "") || "/")

const shortBranch = (value: string) => {
  if (value.startsWith("refs/heads/")) return value.slice("refs/heads/".length)
  return value
}

const refNameFor = (sourceRef: string) => {
  if (sourceRef.startsWith("refs/")) return sourceRef
  return `refs/heads/${sourceRef}`
}

type ListedWorktree = {
  path: string
  head?: string
  branch?: string
  prunable: boolean
}

const parseWorktreeList = (stdout: string) =>
  stdout.split("\n\n").flatMap((block) => {
    const lines = block.split("\n").filter((line) => line.length > 0)
    const worktree = lines.find((line) => line.startsWith("worktree "))
    if (!worktree) return []
    const head = lines.find((line) => line.startsWith("HEAD "))
    const branch = lines.find((line) => line.startsWith("branch "))
    return [
      {
        path: worktree.slice("worktree ".length),
        ...(head === undefined ? {} : { head: head.slice("HEAD ".length) }),
        ...(branch === undefined ? {} : { branch: shortBranch(branch.slice("branch ".length)) }),
        prunable: lines.some((line) => line.startsWith("prunable")),
      } satisfies ListedWorktree,
    ]
  })

const parseNumstat = (stdout: string) =>
  stdout
    .split("\n")
    .filter((line) => line.length > 0)
    .reduce(
      (total, line) => {
        const parts = line.split("\t")
        if (parts.length < 3) return total
        const additions = parts[0] === "-" ? 0 : Number(parts[0])
        const deletions = parts[1] === "-" ? 0 : Number(parts[1])
        if (!Number.isFinite(additions) || !Number.isFinite(deletions)) return total
        return {
          additions: total.additions + additions,
          deletions: total.deletions + deletions,
          modifiedFiles: total.modifiedFiles + 1,
        }
      },
      { additions: 0, deletions: 0, modifiedFiles: 0 },
    )

const parseLeftRight = (stdout: string) => {
  const parts = stdout.trim().split(/\s+/)
  if (parts.length < 2) return undefined
  const behind = Number(parts[0])
  const ahead = Number(parts[1])
  if (!Number.isFinite(behind) || !Number.isFinite(ahead) || behind < 0 || ahead < 0) return undefined
  return { behind, ahead }
}

const runGit = (runner: GitRunnerApi, cwd: string, args: ReadonlyArray<string>) => {
  if (!isAllowedGitArgs(args)) return Effect.succeed(failedGit)
  return runner.run(cwd, args).pipe(Effect.catch(() => Effect.succeed(failedGit)))
}

const stringFact = (
  result: GitResult,
  value: string | undefined,
  source: Source,
  reference: string,
  observedAt: string,
  empty: Unavailable = "inaccessible",
) => {
  if (!result.ok || value === undefined || value.length === 0)
    return RepositoryTopology.StringFact.make(missing(empty, source, reference, observedAt))
  return RepositoryTopology.StringFact.make(available(value, source, reference, observedAt))
}

const taskFact = (
  ownership: TaskOwnership.Snapshot,
  listed: ListedWorktree,
  branch: RepositoryTopology.StringFact,
  head: RepositoryTopology.StringFact,
  observedAt: string,
) => {
  const reference = listed.path
  if (branch.state !== "available" || head.state !== "available")
    return RepositoryTopology.TaskFact.make(missing("unknown", "task_ownership", reference, observedAt))
  if (ownership.entries.length === 0) {
    if (ownership.state === "available" || ownership.state === "absent")
      return RepositoryTopology.TaskFact.make(missing("absent", "task_ownership", reference, observedAt))
    return RepositoryTopology.TaskFact.make(missing(ownership.state, "task_ownership", reference, observedAt))
  }
  const byPath = ownership.entries.filter(
    (entry) => normalizePath(entry.identity.checkout.worktree) === normalizePath(listed.path),
  )
  if (byPath.length === 0)
    return RepositoryTopology.TaskFact.make(missing("absent", "task_ownership", reference, observedAt))
  if (byPath.length > 1)
    return RepositoryTopology.TaskFact.make(missing("invalid", "task_ownership", reference, observedAt))
  const checkout = byPath[0].identity.checkout
  if (checkout.branch !== branch.value || checkout.head !== head.value)
    return RepositoryTopology.TaskFact.make(missing("divergent", "task_ownership", reference, observedAt))
  return RepositoryTopology.TaskFact.make(
    available({ mtTaskID: byPath[0].identity.mtTaskID }, "task_ownership", reference, observedAt),
  )
}

const readBranchPresence = (
  runner: GitRunnerApi,
  root: string,
  sourceRef: string,
  observedAt: string,
): Effect.Effect<RepositoryTopology.Branch> =>
  Effect.gen(function* () {
    const verify = yield* runGit(runner, root, ["show-ref", "--verify", refNameFor(sourceRef)])
    if (verify.ok)
      return RepositoryTopology.Branch.make({
        name: sourceRef,
        presence: RepositoryTopology.PresenceFact.make(available("present", "git_show_ref", sourceRef, observedAt)),
      })
    const listed = yield* runGit(runner, root, ["for-each-ref", "--format=%(refname)", refNameFor(sourceRef)])
    if (listed.ok && listed.stdout.trim().length > 0)
      return RepositoryTopology.Branch.make({
        name: sourceRef,
        presence: RepositoryTopology.PresenceFact.make(available("present", "git_show_ref", sourceRef, observedAt)),
      })
    const state = listed.ok || verify.exitCode === 1 ? "absent" : "unknown"
    return RepositoryTopology.Branch.make({
      name: sourceRef,
      presence: RepositoryTopology.PresenceFact.make(missing(state, "git_show_ref", sourceRef, observedAt)),
    })
  })

const invalidMergeFacts = (listed: ListedWorktree, observedAt: string) => ({
  mergeTarget: RepositoryTopology.StringFact.make(missing("invalid", "repo_config", listed.path, observedAt)),
  ahead: RepositoryTopology.CountFact.make(missing("invalid", "repo_config", listed.path, observedAt)),
  behind: RepositoryTopology.CountFact.make(missing("invalid", "repo_config", listed.path, observedAt)),
  integrationDiff: RepositoryTopology.DiffFact.make(missing("invalid", "repo_config", listed.path, observedAt)),
})

const readWorktree = (
  runner: GitRunnerApi,
  ownership: TaskOwnership.Snapshot,
  listed: ListedWorktree,
  mergeTarget: string,
  observedAt: string,
): Effect.Effect<RepositoryTopology.Worktree> =>
  Effect.gen(function* () {
    const cwd = listed.path
    const pathFact = RepositoryTopology.StringFact.make(
      available(listed.path, "git_worktree_list", listed.path, observedAt),
    )
    const prunable = RepositoryTopology.BooleanFact.make(
      available(listed.prunable, "git_worktree_list", listed.path, observedAt),
    )
    const branchResult = yield* runGit(runner, cwd, ["symbolic-ref", "--quiet", "--short", "HEAD"])
    const branchValue = branchResult.ok ? branchResult.stdout.trim() : listed.branch
    const branchOk = branchResult.ok || listed.branch !== undefined
    const branch = stringFact(
      { ...branchResult, ok: branchOk },
      branchValue,
      "git_rev_parse",
      listed.path,
      observedAt,
      branchOk ? "inaccessible" : "absent",
    )
    const headResult = yield* runGit(runner, cwd, ["rev-parse", "--verify", "HEAD"])
    const headValue = headResult.ok ? headResult.stdout.trim() : listed.head
    const head = stringFact(
      { ...headResult, ok: headResult.ok || listed.head !== undefined },
      headValue,
      "git_rev_parse",
      listed.path,
      observedAt,
    )
    const status = yield* runGit(runner, cwd, [
      "status",
      "--porcelain=v1",
      "--untracked-files=all",
      "--no-renames",
    ])
    const cleanliness = status.ok
      ? RepositoryTopology.CleanlinessFact.make(
          available(status.stdout.trim().length === 0 ? "clean" : "modified", "git_status", listed.path, observedAt),
        )
      : RepositoryTopology.CleanlinessFact.make(missing("unknown", "git_status", listed.path, observedAt))
    const working = yield* runGit(runner, cwd, ["diff", "--no-ext-diff", "--no-renames", "--numstat", "HEAD"])
    const workingTreeDiff = working.ok
      ? RepositoryTopology.DiffFact.make(available(parseNumstat(working.stdout), "git_diff", listed.path, observedAt))
      : RepositoryTopology.DiffFact.make(missing("inaccessible", "git_diff", listed.path, observedAt))
    const measured = {
      path: pathFact,
      branch,
      head,
      cleanliness,
      workingTreeDiff,
      task: taskFact(ownership, listed, branch, head, observedAt),
      prunable,
    }

    if (mergeTarget.length === 0 || !isSafeRef(mergeTarget))
      return RepositoryTopology.Worktree.make({ ...measured, ...invalidMergeFacts(listed, observedAt) })

    const verified = yield* runGit(runner, cwd, ["rev-parse", "--verify", mergeTarget])
    if (!verified.ok) {
      const state = verified.exitCode === 1 || verified.exitCode === 128 ? "absent" : "unknown"
      return RepositoryTopology.Worktree.make({
        ...measured,
        mergeTarget: RepositoryTopology.StringFact.make(missing(state, "git_rev_parse", mergeTarget, observedAt)),
        ahead: RepositoryTopology.CountFact.make(missing("unknown", "git_rev_list", mergeTarget, observedAt)),
        behind: RepositoryTopology.CountFact.make(missing("unknown", "git_rev_list", mergeTarget, observedAt)),
        integrationDiff: RepositoryTopology.DiffFact.make(missing("unknown", "git_diff", mergeTarget, observedAt)),
      })
    }

    const range = `${mergeTarget}...HEAD`
    const counts = yield* runGit(runner, cwd, ["rev-list", "--left-right", "--count", range])
    const parsed = counts.ok ? parseLeftRight(counts.stdout) : undefined
    const ahead =
      parsed === undefined
        ? RepositoryTopology.CountFact.make(missing("unknown", "git_rev_list", range, observedAt))
        : RepositoryTopology.CountFact.make(available(parsed.ahead, "git_rev_list", range, observedAt))
    const behind =
      parsed === undefined
        ? RepositoryTopology.CountFact.make(missing("unknown", "git_rev_list", range, observedAt))
        : RepositoryTopology.CountFact.make(available(parsed.behind, "git_rev_list", range, observedAt))
    const integration = yield* runGit(runner, cwd, ["diff", "--no-ext-diff", "--no-renames", "--numstat", range])
    const integrationDiff = integration.ok
      ? RepositoryTopology.DiffFact.make(available(parseNumstat(integration.stdout), "git_diff", range, observedAt))
      : RepositoryTopology.DiffFact.make(missing("inaccessible", "git_diff", range, observedAt))

    return RepositoryTopology.Worktree.make({
      ...measured,
      mergeTarget: RepositoryTopology.StringFact.make(available(mergeTarget, "repo_config", listed.path, observedAt)),
      ahead,
      behind,
      integrationDiff,
    })
  })

const readRepository = (
  runner: GitRunnerApi,
  ownership: TaskOwnership.Snapshot,
  input: RepositoryTopology.RepositoryInput,
  observedAt: string,
): Effect.Effect<RepositoryTopology.Repository> =>
  Effect.gen(function* () {
    const top = yield* runGit(runner, input.root, ["rev-parse", "--show-toplevel"])
    const sourceRepo = stringFact(top, top.ok ? top.stdout.trim() : undefined, "git_rev_parse", input.root, observedAt)
    const listed = yield* runGit(runner, input.root, ["worktree", "list", "--porcelain"])
    const worktrees = listed.ok
      ? yield* Effect.forEach(parseWorktreeList(listed.stdout), (item) =>
          readWorktree(runner, ownership, item, input.mergeTarget, observedAt),
        )
      : []
    const branches = yield* Effect.forEach(input.sourceRefs, (ref) =>
      readBranchPresence(runner, input.root, ref, observedAt),
    )
    return RepositoryTopology.Repository.make({
      sourceRepo,
      branches,
      worktrees,
    })
  })

const snapshotState = (repositories: ReadonlyArray<RepositoryTopology.Repository>): State => {
  if (repositories.length === 0) return "absent"
  if (repositories.every((repo) => repo.sourceRepo.state !== "available")) return "inaccessible"
  return "available"
}

export const layerFromGit = Layer.effect(
  Service,
  Effect.gen(function* () {
    const runner = yield* GitRunner
    const read = Effect.fn("RepositoryTopology.read")(function* (input: Input) {
      const observedAt = new Date().toISOString()
      const repositories = yield* Effect.forEach(input.repositories, (repo) =>
        readRepository(runner, input.ownership, repo, observedAt),
      )
      return RepositoryTopology.Snapshot.make({
        state: snapshotState(repositories),
        provenance: provenance("repo_config", "repository_topology"),
        freshness: freshness(observedAt),
        repositories,
      })
    })
    return Service.of({ read })
  }),
)

export const layer = layerFromGit.pipe(Layer.provide(gitLayer))

export const node = makeGlobalNode({
  service: Service,
  layer,
  deps: [],
})
