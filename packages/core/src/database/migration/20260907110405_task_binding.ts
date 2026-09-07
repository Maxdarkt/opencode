import { Effect } from "effect"
import type { DatabaseMigration } from "../migration"

export default {
  id: "20260907110405_task_binding",
  up(tx) {
    return Effect.gen(function* () {
      yield* tx.run(`
        CREATE TABLE \`task_binding\` (
          \`mt_task_id\` text PRIMARY KEY,
          \`apex_external_ref\` text NOT NULL,
          \`session_id\` text NOT NULL,
          \`project_id\` text NOT NULL,
          \`location_directory\` text NOT NULL,
          \`location_workspace_id\` text,
          \`repository\` text NOT NULL,
          \`branch\` text NOT NULL,
          \`worktree\` text NOT NULL,
          \`head\` text NOT NULL,
          \`version\` integer NOT NULL,
          \`time_created\` integer NOT NULL,
          \`time_updated\` integer NOT NULL,
          CONSTRAINT \`fk_task_binding_session_id_session_id_fk\` FOREIGN KEY (\`session_id\`) REFERENCES \`session\`(\`id\`) ON DELETE CASCADE,
          CONSTRAINT \`fk_task_binding_project_id_project_id_fk\` FOREIGN KEY (\`project_id\`) REFERENCES \`project\`(\`id\`) ON DELETE CASCADE
        );
      `)
      yield* tx.run(
        `CREATE UNIQUE INDEX \`task_binding_apex_external_ref_idx\` ON \`task_binding\` (\`apex_external_ref\`);`,
      )
      yield* tx.run(`CREATE UNIQUE INDEX \`task_binding_session_idx\` ON \`task_binding\` (\`session_id\`);`)
      yield* tx.run(`CREATE INDEX \`task_binding_project_idx\` ON \`task_binding\` (\`project_id\`);`)
    })
  },
} satisfies DatabaseMigration.Migration
