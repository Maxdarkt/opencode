import { expect } from "bun:test"
import { $ } from "bun"
import fs from "fs/promises"
import path from "path"
import { Effect } from "effect"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { LocalContext } from "@opencode-ai/core/local-context"
import { tmpdir } from "./fixture/tmpdir"
import { testEffect } from "./lib/effect"

const it = testEffect(LayerNode.compile(LocalContext.node))
const fixture = () =>
  Effect.acquireRelease(Effect.promise(tmpdir), (dir) => Effect.promise(() => dir[Symbol.asyncDispose]()))
async function init(directory: string) {
  await $`git init -b main ${directory}`.quiet()
  await $`git -C ${directory} -c user.name=Test -c user.email=test@example.com -c commit.gpgsign=false commit --allow-empty -m initial`.quiet()
}

it.live("reports absent, file, relative, non-Git and symlink without creating a repository", () =>
  Effect.gen(function* () {
    const root = yield* fixture()
    const svc = yield* LocalContext.Service
    expect((yield* svc.inspect({ directory: path.join(root.path, "missing") })).availability).toBe("absent")
    expect((yield* svc.inspect({ directory: "." })).availability).toBe("invalid")
    yield* Effect.promise(() => fs.writeFile(path.join(root.path, "file"), "text"))
    expect((yield* svc.inspect({ directory: path.join(root.path, "file") })).availability).toBe("not_directory")
    yield* Effect.promise(() => fs.symlink(root.path, path.join(root.path, "alias")))
    const info = yield* svc.inspect({ directory: path.join(root.path, "alias") })
    expect(info.canonical_directory).toBe(root.path)
    expect(info.git?.status).toBe("non_git")
    expect(info.git?.review).toBe("incomplete")
    expect(
      yield* Effect.promise(() =>
        fs.access(path.join(root.path, ".git")).then(
          () => true,
          () => false,
        ),
      ),
    ).toBe(false)
  }),
)

it.live("distinguishes requested, canonical and persisted session paths", () =>
  Effect.gen(function* () {
    const root = yield* fixture()
    const svc = yield* LocalContext.Service
    yield* Effect.promise(() => fs.symlink(root.path, path.join(root.path, "alias")))
    const info = yield* svc.inspect({
      directory: root.path,
      session: { status: "found", directory: path.join(root.path, "alias") },
    })
    expect(info.concordance).toBe("matches")
    expect(info.session_directory).not.toBe(info.canonical_directory)
    expect(
      (yield* svc.inspect({ directory: root.path, session: { status: "found", directory: path.dirname(root.path) } }))
        .concordance,
    ).toBe("mismatch")
    expect((yield* svc.inspect({ directory: root.path, session: { status: "missing" } })).concordance).toBe("unknown")
    expect(
      (yield* svc.inspect({ directory: root.path, session: { status: "workspace", directory: root.path } }))
        .concordance,
    ).toBe("unknown")
  }),
)

it.live("reports base resolution and dirty without changing index, HEAD or refs", () =>
  Effect.gen(function* () {
    const root = yield* fixture()
    yield* Effect.promise(() => init(root.path))
    yield* Effect.promise(async () => {
      await fs.writeFile(path.join(root.path, "tracked"), "one")
      await $`git -C ${root.path} add tracked`.quiet()
      await $`git -C ${root.path} -c user.name=Test -c user.email=test@example.com -c commit.gpgsign=false commit -m tracked`.quiet()
    })
    const before = yield* Effect.promise(() => snapshot(root.path))
    const svc = yield* LocalContext.Service
    const clean = yield* svc.inspect({ directory: root.path, base_ref: "HEAD" })
    expect(clean.git).toMatchObject({
      status: "available",
      head_status: "branch",
      branch: "main",
      base_status: "resolved",
      review: "clean",
      dirty: false,
    })
    expect(clean.git?.head).toBe(clean.git?.base_oid)
    expect((yield* svc.inspect({ directory: root.path })).git?.review).toBe("incomplete")
    expect((yield* svc.inspect({ directory: root.path, base_ref: "does-not-exist" })).git).toMatchObject({
      base_status: "unresolved",
      base_oid: null,
      review: "incomplete",
    })
    expect((yield* svc.inspect({ directory: root.path, base_ref: "--help" })).git?.base_status).toBe("unresolved")
    expect(yield* Effect.promise(() => snapshot(root.path))).toEqual(before)
    yield* Effect.promise(() => fs.writeFile(path.join(root.path, "untracked"), "new"))
    expect((yield* svc.inspect({ directory: root.path, base_ref: "HEAD" })).git).toMatchObject({
      dirty: true,
      review: "changed",
      conflicts: false,
    })
  }),
)

it.live("keeps two clones with the same origin distinct and recognizes detached and unborn", () =>
  Effect.gen(function* () {
    const root = yield* fixture()
    const source = path.join(root.path, "source")
    yield* Effect.promise(() => init(source))
    const a = path.join(root.path, "a")
    const b = path.join(root.path, "b")
    yield* Effect.promise(async () => {
      await $`git clone ${source} ${a}`.quiet()
      await $`git clone ${source} ${b}`.quiet()
      await $`git -C ${b} checkout --detach`.quiet()
    })
    const svc = yield* LocalContext.Service
    const first = yield* svc.inspect({ directory: a, base_ref: "HEAD" })
    const second = yield* svc.inspect({ directory: b, base_ref: "HEAD" })
    expect(first.git?.head).toBe(second.git?.head)
    expect(first.git?.top_level).toBe(a)
    expect(second.git?.top_level).toBe(b)
    expect(second.git).toMatchObject({ head_status: "detached", branch: null })
    const unborn = path.join(root.path, "unborn")
    yield* Effect.promise(async () => {
      await $`git init -b main ${unborn}`.quiet()
    })
    expect((yield* svc.inspect({ directory: unborn, base_ref: "HEAD" })).git).toMatchObject({
      head_status: "unborn",
      head: null,
      review: "incomplete",
    })
  }),
)

it.live("reports inaccessible directories and damaged Git as unavailable", () =>
  Effect.gen(function* () {
    const root = yield* fixture()
    const locked = path.join(root.path, "locked")
    yield* Effect.promise(() => fs.mkdir(locked))
    yield* Effect.promise(() => fs.chmod(locked, 0))
    yield* Effect.addFinalizer(() => Effect.promise(() => fs.chmod(locked, 0o700)))
    const svc = yield* LocalContext.Service
    expect((yield* svc.inspect({ directory: path.join(locked, "child") })).availability).toBe("inaccessible")
    expect((yield* svc.inspect({ directory: locked })).availability).toBe("inaccessible")
    yield* Effect.promise(() => fs.writeFile(path.join(root.path, ".git"), "gitdir: /missing-git-dir\n"))
    expect((yield* svc.inspect({ directory: root.path })).git?.status).toBe("unavailable")
  }),
)

async function snapshot(directory: string) {
  return {
    index: (await fs.readFile(path.join(directory, ".git/index"))).toString("hex"),
    head: await fs.readFile(path.join(directory, ".git/HEAD"), "utf8"),
    refs: await $`git -C ${directory} show-ref`.text(),
  }
}

it.live("exposes conflicts from the real index and preserves it", () =>
  Effect.gen(function* () {
    const root = yield* fixture()
    yield* Effect.promise(() => init(root.path))
    yield* Effect.promise(async () => {
      await fs.writeFile(path.join(root.path, "conflict"), "value\n")
      const oid = (await $`git -C ${root.path} hash-object -w conflict`.text()).trim()
      const entries = `100644 ${oid} 1\tconflict\n100644 ${oid} 2\tconflict\n100644 ${oid} 3\tconflict\n`
      await $`git -C ${root.path} update-index --index-info < ${new Blob([entries])}`.quiet()
    })
    const before = yield* Effect.promise(() => snapshot(root.path))
    const svc = yield* LocalContext.Service
    expect((yield* svc.inspect({ directory: root.path, base_ref: "HEAD" })).git).toMatchObject({
      conflicts: true,
      dirty: true,
      review: "conflicts",
    })
    expect(yield* Effect.promise(() => snapshot(root.path))).toEqual(before)
  }),
)

it.live("observes linked worktree identity and a committed difference from an explicit base", () =>
  Effect.gen(function* () {
    const root = yield* fixture()
    const source = path.join(root.path, "source")
    const linked = path.join(root.path, "linked")
    yield* Effect.promise(async () => {
      await init(source)
      await fs.writeFile(path.join(source, "new"), "value\n")
      await $`git -C ${source} add new`.quiet()
      await $`git -C ${source} -c user.name=Test -c user.email=test@example.com -c commit.gpgsign=false commit -m second`.quiet()
      await $`git -C ${source} worktree add --detach ${linked}`.quiet()
    })
    const svc = yield* LocalContext.Service
    const info = yield* svc.inspect({ directory: linked, base_ref: "HEAD~1" })
    expect(info.git).toMatchObject({
      top_level: linked,
      head_status: "detached",
      dirty: false,
      review: "changed",
      common_directory: path.join(source, ".git"),
    })
    expect(info.git?.git_directory).not.toBe(info.git?.common_directory)
  }),
)
