import path from "path"
import { Context, Effect, Layer } from "effect"
import { ChildProcess } from "effect/unstable/process"
import { LocalContext } from "@opencode-ai/schema/local-context"
import { FSUtil } from "./fs-util"
import { AppProcess } from "./process"
import { makeGlobalNode } from "./effect/app-node"

export interface Input {
  readonly directory: string
  readonly base_ref?: string
  readonly session?: { readonly status: LocalContext.Info["session_status"]; readonly directory?: string }
}

export class Service extends Context.Service<
  Service,
  {
    readonly inspect: (input: Input) => Effect.Effect<LocalContext.Info>
  }
>()("@opencode/LocalContext") {}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const fs = yield* FSUtil.Service
    const proc = yield* AppProcess.Service

    const inspect = Effect.fn("LocalContext.inspect")(function* (input: Input) {
      const initial: LocalContext.Info = {
        requested_directory: input.directory,
        canonical_directory: null,
        availability: "invalid",
        session_directory: input.session?.directory ?? null,
        session_canonical_directory: null,
        session_status: input.session?.status ?? "not_requested",
        concordance: input.session ? "unknown" : "not_applicable",
        git: null,
      }
      if (!path.isAbsolute(input.directory) || input.directory.includes("\0")) return initial
      const observed = yield* fs.realPath(input.directory).pipe(
        Effect.flatMap((directory) => fs.stat(directory).pipe(Effect.map((stat) => ({ directory, stat })))),
        Effect.map((value) => ({ value, availability: "available" as const })),
        Effect.catchReason("PlatformError", "NotFound", () =>
          Effect.succeed({ value: undefined, availability: "absent" as const }),
        ),
        Effect.catch(() => Effect.succeed({ value: undefined, availability: "inaccessible" as const })),
      )
      if (!observed.value) return { ...initial, availability: observed.availability }
      if (observed.value.stat.type !== "Directory")
        return { ...initial, availability: "not_directory" as const, canonical_directory: observed.value.directory }
      const directory = observed.value.directory
      const accessible = yield* fs.access(directory, { readable: true }).pipe(
        Effect.as(true),
        Effect.catch(() => Effect.succeed(false)),
      )
      if (!accessible) return { ...initial, canonical_directory: directory, availability: "inaccessible" as const }
      const persisted = input.session?.directory
        ? yield* fs.realPath(input.session.directory).pipe(Effect.catch(() => Effect.succeed(null)))
        : null
      const result: LocalContext.Info = {
        ...initial,
        availability: "available",
        canonical_directory: directory,
        session_canonical_directory: persisted,
        concordance:
          input.session?.status === "found" && persisted
            ? persisted === directory
              ? "matches"
              : "mismatch"
            : initial.concordance,
      }
      // Disable optional index refresh and external fsmonitor helpers on this read-only observation.
      const git = (args: string[]) =>
        proc
          .run(
            ChildProcess.make("git", ["--no-optional-locks", "-c", "core.fsmonitor=false", ...args], {
              cwd: directory,
              extendEnv: false,
              stdin: "ignore",
              env: Object.fromEntries(
                Object.entries(process.env).flatMap(([key, value]) =>
                  key.startsWith("GIT_") || value === undefined ? [] : [[key, value]],
                ),
              ),
            }),
            { timeout: "5 seconds", maxOutputBytes: 1024 * 1024, maxErrorBytes: 4096 },
          )
          .pipe(
            Effect.map((value) => ({
              code: value.exitCode,
              text: value.stdout.toString("utf8").replace(/[\r\n]+$/, ""),
              truncated: value.stdoutTruncated,
            })),
            Effect.catch(() => Effect.succeed({ code: -1, text: "", truncated: true })),
          )
      const empty: NonNullable<LocalContext.Info["git"]> = {
        status: "unavailable",
        top_level: null,
        git_directory: null,
        common_directory: null,
        branch: null,
        head: null,
        head_status: "unknown",
        base_ref: input.base_ref ?? null,
        base_oid: null,
        base_status: input.base_ref === undefined ? "not_requested" : "unresolved",
        dirty: null,
        conflicts: null,
        review: "incomplete",
      }
      const top = yield* git(["rev-parse", "--show-toplevel"])
      if (top.code !== 0) {
        // A .git marker with failed discovery is damaged/inaccessible, never a confirmed non-Git folder.
        const markers = yield* fs
          .up({ targets: [".git"], start: directory })
          .pipe(Effect.catch(() => Effect.succeed(undefined)))
        return {
          ...result,
          git: {
            ...empty,
            status: top.code > 0 && markers?.length === 0 ? ("non_git" as const) : ("unavailable" as const),
          },
        }
      }
      const [gitDir, commonDir, branch, head, status, base] = yield* Effect.all(
        [
          git(["rev-parse", "--absolute-git-dir"]),
          git(["rev-parse", "--path-format=absolute", "--git-common-dir"]),
          git(["symbolic-ref", "--quiet", "--short", "HEAD"]),
          git(["rev-parse", "--verify", "HEAD^{commit}"]),
          git(["status", "--porcelain=v1", "-z", "--untracked-files=normal", "--ignore-submodules=none"]),
          input.base_ref === undefined
            ? Effect.succeed({ code: 1, text: "", truncated: false })
            : git(["rev-parse", "--verify", "--end-of-options", `${input.base_ref}^{commit}`]),
        ],
        { concurrency: 6 },
      )
      const unborn =
        head.code !== 0 && branch.code === 0
          ? (yield* git(["show-ref", "--verify", "--quiet", `refs/heads/${branch.text}`])).code === 1
          : false
      const baseOID = base.code === 0 && !base.truncated ? base.text : null
      const comparison = baseOID
        ? yield* git(["diff", "--quiet", "--no-ext-diff", "--no-textconv", baseOID, "--"])
        : null
      const statusFlags = status.text.split("\0").reduce(
        (acc, entry) =>
          acc.skip
            ? { ...acc, skip: false }
            : {
                skip: /^[RC]|^.[RC]/.test(entry),
                conflicts: acc.conflicts || ["DD", "AU", "UD", "UA", "DU", "AA", "UU"].includes(entry.slice(0, 2)),
              },
        { skip: false, conflicts: false },
      )
      const complete = status.code === 0 && !status.truncated
      const conflicts = complete ? statusFlags.conflicts : null
      const dirty = complete ? status.text.length > 0 : null
      return {
        ...result,
        git: {
          ...empty,
          status: "available" as const,
          top_level: top.text,
          git_directory: gitDir.code === 0 ? gitDir.text : null,
          common_directory: commonDir.code === 0 ? commonDir.text : null,
          branch: branch.code === 0 ? branch.text : null,
          head: head.code === 0 ? head.text : null,
          head_status:
            head.code === 0
              ? branch.code === 0
                ? ("branch" as const)
                : branch.code === 1
                  ? ("detached" as const)
                  : ("unknown" as const)
              : unborn
                ? ("unborn" as const)
                : ("unknown" as const),
          base_oid: baseOID,
          base_status: baseOID ? ("resolved" as const) : empty.base_status,
          dirty,
          conflicts,
          review: conflicts
            ? ("conflicts" as const)
            : !complete ||
                !comparison ||
                ![0, 1].includes(comparison.code) ||
                head.code !== 0 ||
                gitDir.code !== 0 ||
                commonDir.code !== 0 ||
                ![0, 1].includes(branch.code)
              ? ("incomplete" as const)
              : dirty || comparison.code === 1
                ? ("changed" as const)
                : ("clean" as const),
        },
      }
    })
    return Service.of({ inspect })
  }),
)

export const node = makeGlobalNode({ service: Service, layer, deps: [FSUtil.node, AppProcess.node] })
export * as LocalContext from "./local-context"
