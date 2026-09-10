import { Database } from "@opencode-ai/core/database/database"
import { AppNodeBuilder } from "@opencode-ai/core/effect/app-node-builder"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { AbsolutePath } from "@opencode-ai/core/schema"
import { ProjectV2 } from "@opencode-ai/core/project"
import { ProjectTable } from "@opencode-ai/core/project/sql"
import { SessionSchema } from "@opencode-ai/core/session/schema"
import { SessionTable } from "@opencode-ai/core/session/sql"
import { TaskAuthority } from "@opencode-ai/core/task-authority"
import { TaskBinding } from "@opencode-ai/core/task-binding"
import { TaskExecution } from "@opencode-ai/core/task-execution"
import { TaskPilot } from "@opencode-ai/core/task-pilot"
import { Effect } from "effect"
import path from "path"

const [databasePath, snapshotPath, worktreeArgument] = process.argv.slice(2)

if (!databasePath || !snapshotPath || !worktreeArgument)
  throw new Error(
    "Usage: bun run script/create-task-pilot-fixture.ts <database-path> <authority-snapshot-path> <worktree>",
  )

const worktree = path.resolve(worktreeArgument)
const database = path.resolve(databasePath)
const snapshot = path.resolve(snapshotPath)

if (await Bun.file(database).exists()) throw new Error(`Database path already exists: ${database}`)
if (!(await Bun.file(snapshot).exists())) throw new Error(`Authority snapshot does not exist: ${snapshot}`)

const git = async (args: string[]) => {
  const process = Bun.spawn(["git", "-C", worktree, ...args], { stdout: "pipe", stderr: "pipe" })
  if ((await process.exited) !== 0) throw new Error((await new Response(process.stderr).text()).trim())
  return (await new Response(process.stdout).text()).trim()
}

const head = await git(["rev-parse", "HEAD"])
const branch = await git(["branch", "--show-current"])
if (!branch) throw new Error(`Worktree has no branch: ${worktree}`)

const source = (await Bun.file(snapshot).json()) as {
  tasks?: ReadonlyArray<{ id?: unknown; git?: { worktreePath?: unknown; head?: unknown } }>
}
const task = source.tasks?.find((candidate) => candidate.git?.worktreePath === worktree && candidate.git?.head === head)
if (!task || typeof task.id !== "string" || !task.id)
  throw new Error(`Authority snapshot has no task for ${worktree} at ${head}`)

const taskID = task.id
const sessionID = SessionSchema.ID.make("ses_task_pilot_fixture")
const projectID = ProjectV2.ID.make("project_task_pilot_fixture")
const identity = TaskBinding.Identity.make({
  mtTaskID: taskID,
  apexExternalRef: ".project/fixtures/task-pilot",
  sessionID,
  projectID,
  location: { directory: AbsolutePath.make(worktree) },
  checkout: { repository: AbsolutePath.make(worktree), branch, worktree: AbsolutePath.make(worktree), head },
})
const layer = AppNodeBuilder.build(
  LayerNode.group([Database.node, TaskBinding.node, TaskExecution.node, TaskAuthority.node]),
  [[Database.node, Database.layerFromPath(database)]],
)

const result = await Effect.runPromise(
  Effect.gen(function* () {
    const { db } = yield* Database.Service
    const binding = yield* TaskBinding.Service
    const execution = yield* TaskExecution.Service
    const authority = yield* TaskAuthority.Service

    yield* db
      .insert(ProjectTable)
      .values({ id: projectID, worktree: AbsolutePath.make(worktree), sandboxes: [] })
      .run()
    yield* db
      .insert(SessionTable)
      .values({
        id: sessionID,
        project_id: projectID,
        slug: "task-pilot-fixture",
        directory: AbsolutePath.make(worktree),
        title: "Task Pilot Fixture",
        version: "fixture",
      })
      .run()
    yield* binding.adopt(identity)
    yield* execution.acquire(identity, "task-pilot-fixture")

    const observation = yield* authority.observe({ mtTaskID: taskID, worktree, head, snapshotPath: snapshot })
    if (observation.state !== "available" || !observation.mtStatus || !observation.apexPhase)
      return yield* Effect.die(`Fixture authority is not available: ${JSON.stringify(observation)}`)
    const pilot = TaskPilot.evaluate({
      mtStatus: observation.mtStatus,
      apexPhase: observation.apexPhase,
      context: "concordant",
    })
    if (pilot.kind !== "next" || pilot.action !== "write_plan")
      return yield* Effect.die(`Fixture pilot result is unexpected: ${JSON.stringify(pilot)}`)
    return { observation, pilot }
  }).pipe(Effect.provide(layer)),
)

console.log(
  JSON.stringify(
    {
      database,
      snapshot,
      worktree,
      branch,
      head,
      taskID,
      sessionID,
      ...result,
    },
    null,
    2,
  ),
)
