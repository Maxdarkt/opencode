import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"
import { TaskBinding } from "@opencode-ai/schema/task-binding"
import { absoluteColumn, directoryColumn } from "../database/path"
import { Timestamps } from "../database/schema.sql"
import { ProjectTable } from "../project/sql"
import { ProjectV2 } from "../project"
import { SessionSchema } from "../session/schema"
import { SessionTable } from "../session/sql"
import { WorkspaceV2 } from "../workspace"

export const TaskBindingTable = sqliteTable(
  "task_binding",
  {
    mt_task_id: text().primaryKey(),
    apex_external_ref: text().notNull(),
    session_id: text()
      .$type<SessionSchema.ID>()
      .notNull()
      .references(() => SessionTable.id, { onDelete: "cascade" }),
    project_id: text()
      .$type<ProjectV2.ID>()
      .notNull()
      .references(() => ProjectTable.id, { onDelete: "cascade" }),
    location_directory: directoryColumn().notNull(),
    location_workspace_id: text().$type<WorkspaceV2.ID>(),
    repository: absoluteColumn().notNull(),
    branch: text().notNull(),
    worktree: absoluteColumn().notNull(),
    head: text().notNull(),
    version: integer().$type<TaskBinding.Version>().notNull(),
    ...Timestamps,
  },
  (table) => [
    uniqueIndex("task_binding_apex_external_ref_idx").on(table.apex_external_ref),
    uniqueIndex("task_binding_session_idx").on(table.session_id),
    index("task_binding_project_idx").on(table.project_id),
  ],
)
