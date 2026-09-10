import { Effect } from "effect"
import type { DatabaseMigration } from "../migration"

export default {
  id: "20260907113953_task_execution_ownership",
  up(tx) {
    return Effect.gen(function* () {
      yield* tx.run(`
        CREATE TABLE \`task_execution_effect\` (
          \`mt_task_id\` text NOT NULL,
          \`effect_id\` text NOT NULL,
          \`state\` text NOT NULL,
          \`time_created\` integer NOT NULL,
          \`time_updated\` integer NOT NULL,
          CONSTRAINT \`task_execution_effect_pk\` PRIMARY KEY(\`mt_task_id\`, \`effect_id\`),
          CONSTRAINT \`fk_task_execution_effect_mt_task_id_task_execution_ownership_mt_task_id_fk\` FOREIGN KEY (\`mt_task_id\`) REFERENCES \`task_execution_ownership\`(\`mt_task_id\`) ON DELETE CASCADE
        );
      `)
      yield* tx.run(`
        CREATE TABLE \`task_execution_ownership\` (
          \`mt_task_id\` text PRIMARY KEY,
          \`session_id\` text NOT NULL,
          \`worktree\` text NOT NULL,
          \`owner_id\` text NOT NULL,
          \`generation\` integer NOT NULL,
          \`time_created\` integer NOT NULL,
          \`time_updated\` integer NOT NULL,
          CONSTRAINT \`fk_task_execution_ownership_mt_task_id_task_binding_mt_task_id_fk\` FOREIGN KEY (\`mt_task_id\`) REFERENCES \`task_binding\`(\`mt_task_id\`) ON DELETE CASCADE
        );
      `)
      yield* tx.run(
        `CREATE INDEX \`task_execution_effect_state_idx\` ON \`task_execution_effect\` (\`mt_task_id\`,\`state\`);`,
      )
      yield* tx.run(
        `CREATE UNIQUE INDEX \`task_execution_ownership_session_idx\` ON \`task_execution_ownership\` (\`session_id\`);`,
      )
      yield* tx.run(
        `CREATE UNIQUE INDEX \`task_execution_ownership_worktree_idx\` ON \`task_execution_ownership\` (\`worktree\`);`,
      )
      yield* tx.run(
        `CREATE INDEX \`task_execution_ownership_owner_idx\` ON \`task_execution_ownership\` (\`owner_id\`);`,
      )
    })
  },
} satisfies DatabaseMigration.Migration
