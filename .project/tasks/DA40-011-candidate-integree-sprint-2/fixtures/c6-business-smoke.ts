import { Database } from "bun:sqlite"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

const commands = ["seed", "concordant", "divergent", "pending", "resume", "inspect"] as const
type Command = (typeof commands)[number]

const command = process.argv[2] as Command | undefined
if (!command || !commands.includes(command)) {
  console.error(`usage: bun ${path.relative(process.cwd(), import.meta.path)} <${commands.join("|")}>`)
  process.exit(2)
}

const worktree = path.resolve(import.meta.dir, "../../../..")
const sessionID = "ses_da40_011_smoke_s2"
const taskID = "DA40-011-SMOKE"
const effectID = "c6-smoke-effect"
const server = "http://127.0.0.1:4151"

function git(...args: string[]) {
  const result = Bun.spawnSync(["git", "-C", worktree, ...args])
  if (result.exitCode !== 0) throw new Error(result.stderr.toString().trim() || `git ${args.join(" ")} failed`)
  return result.stdout.toString().trim()
}

const branch = git("branch", "--show-current")
const head = git("rev-parse", "HEAD")
const commonGit = git("rev-parse", "--path-format=absolute", "--git-common-dir")
const repository = path.dirname(commonGit)
const divergentHead = "9ba850b68b49bd20e2e40d24ceba39dd5fb19af2"

function databaseCandidates() {
  const explicit = process.env.C6_DB
  if (explicit) return [path.resolve(explicit)]
  const data = process.env.XDG_DATA_HOME ?? path.join(os.homedir(), ".local", "share")
  return [path.join(data, "opencode", "opencode-local.db"), path.join(data, "opencode", "opencode.db")]
}

function openFixtureDatabase() {
  const matches = databaseCandidates().flatMap((candidate) => {
    if (!fs.existsSync(candidate)) return []
    const db = new Database(candidate)
    const tables = db
      .query<
        { count: number },
        []
      >("SELECT count(*) AS count FROM sqlite_master WHERE type='table' AND name IN ('project_directory','task_binding','task_execution_ownership','task_execution_effect')")
      .get()
    const project =
      tables?.count === 4
        ? db
            .query<
              { project_id: string },
              [string]
            >("SELECT project_id FROM project_directory WHERE directory = ? LIMIT 1")
            .get(worktree)
        : undefined
    if (project) return [{ path: candidate, db, projectID: project.project_id }]
    db.close()
    return []
  })
  if (matches.length !== 1) {
    matches.forEach((match) => match.db.close())
    throw new Error(`expected one OpenCode DB for ${worktree}, found ${matches.length}; set C6_DB explicitly`)
  }
  return matches[0]!
}

const fixture = openFixtureDatabase()
const db = fixture.db
db.run("PRAGMA foreign_keys = ON")
db.run("PRAGMA busy_timeout = 5000")

function upsert(state: Exclude<Command, "inspect">) {
  const now = Date.now()
  const desiredHead = state === "divergent" ? divergentHead : head
  const desiredEffect = state === "pending" ? "pending" : "confirmed"
  const resumed = state === "resume"
  db.transaction(() => {
    db.query(
      `INSERT INTO session (
        id, project_id, workspace_id, parent_id, slug, directory, path, title, version,
        cost, tokens_input, tokens_output, tokens_reasoning, tokens_cache_read, tokens_cache_write,
        time_created, time_updated
      ) VALUES (?, ?, NULL, NULL, ?, ?, NULL, ?, ?, 0, 0, 0, 0, 0, 0, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        project_id=excluded.project_id, directory=excluded.directory, title=excluded.title,
        version=excluded.version, time_updated=excluded.time_updated`,
    ).run(
      sessionID,
      fixture.projectID,
      "da40-011-smoke",
      worktree,
      "DA40-011 — fixture smoke métier",
      "local-smoke",
      now,
      now,
    )
    db.query(
      `INSERT INTO task_binding (
        mt_task_id, apex_external_ref, session_id, project_id, location_directory,
        location_workspace_id, repository, branch, worktree, head, version, time_created, time_updated
      ) VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, 1, ?, ?)
      ON CONFLICT(mt_task_id) DO UPDATE SET
        apex_external_ref=excluded.apex_external_ref, session_id=excluded.session_id,
        project_id=excluded.project_id, location_directory=excluded.location_directory,
        location_workspace_id=NULL, repository=excluded.repository, branch=excluded.branch,
        worktree=excluded.worktree, head=excluded.head, version=1, time_updated=excluded.time_updated`,
    ).run(
      taskID,
      ".project/tasks/DA40-011-candidate-integree-sprint-2#c6-smoke",
      sessionID,
      fixture.projectID,
      worktree,
      repository,
      branch,
      worktree,
      desiredHead,
      now,
      now,
    )
    db.query(
      `INSERT INTO task_execution_ownership (
        mt_task_id, session_id, worktree, owner_id, generation, time_created, time_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(mt_task_id) DO UPDATE SET
        session_id=excluded.session_id, worktree=excluded.worktree, owner_id=excluded.owner_id,
        generation=excluded.generation, time_updated=excluded.time_updated`,
    ).run(taskID, sessionID, worktree, resumed ? "c6-smoke-resumed" : "c6-smoke-owner", resumed ? 2 : 1, now, now)
    db.query(
      `INSERT INTO task_execution_effect (mt_task_id, effect_id, state, time_created, time_updated)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(mt_task_id, effect_id) DO UPDATE SET state=excluded.state, time_updated=excluded.time_updated`,
    ).run(taskID, effectID, desiredEffect, now, now)
  })()
}

if (command !== "inspect") upsert(command)

const result = db
  .query<
    {
      session_id: string
      directory: string
      mt_task_id: string
      branch: string
      head: string
      owner_id: string
      generation: number
      effect_id: string
      state: string
    },
    [string]
  >(
    `SELECT s.id AS session_id, s.directory, b.mt_task_id, b.branch, b.head,
            o.owner_id, o.generation, e.effect_id, e.state
       FROM session s
       JOIN task_binding b ON b.session_id = s.id
       JOIN task_execution_ownership o ON o.mt_task_id = b.mt_task_id
       JOIN task_execution_effect e ON e.mt_task_id = b.mt_task_id
      WHERE s.id = ?`,
  )
  .get(sessionID)

if (!result) throw new Error("fixture row was not found")
const expected = result.head !== head ? "divergent" : result.state === "pending" ? "resuming" : "concordant"
const serverKey = Buffer.from(server).toString("base64url")
console.log(
  JSON.stringify(
    {
      command,
      expected,
      database: fixture.path,
      projectID: fixture.projectID,
      git: { worktree, branch, head },
      fixture: result,
      contextURL: `${server}/global/context?directory=${encodeURIComponent(worktree)}&session_id=${sessionID}`,
      uiURL: `http://127.0.0.1:4451/server/${serverKey}/session/${sessionID}`,
    },
    null,
    2,
  ),
)
db.close()
