import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"
import { TaskExecution } from "@opencode-ai/schema/task-execution"
import { absoluteColumn } from "../database/path"
import { Timestamps } from "../database/schema.sql"
import { SessionSchema } from "../session/schema"
import { TaskBindingTable } from "../task-binding/sql"

export const TaskExecutionOwnershipTable = sqliteTable(
  "task_execution_ownership",
  {
    mt_task_id: text()
      .primaryKey()
      .references(() => TaskBindingTable.mt_task_id, { onDelete: "cascade" }),
    session_id: text().$type<SessionSchema.ID>().notNull(),
    worktree: absoluteColumn().notNull(),
    owner_id: text().$type<TaskExecution.OwnerID>().notNull(),
    generation: integer().$type<TaskExecution.Generation>().notNull(),
    ...Timestamps,
  },
  (table) => [
    uniqueIndex("task_execution_ownership_session_idx").on(table.session_id),
    uniqueIndex("task_execution_ownership_worktree_idx").on(table.worktree),
    index("task_execution_ownership_owner_idx").on(table.owner_id),
  ],
)

export const TaskExecutionEffectTable = sqliteTable(
  "task_execution_effect",
  {
    mt_task_id: text()
      .notNull()
      .references(() => TaskExecutionOwnershipTable.mt_task_id, { onDelete: "cascade" }),
    effect_id: text().$type<TaskExecution.EffectID>().notNull(),
    state: text().$type<TaskExecution.EffectState>().notNull(),
    ...Timestamps,
  },
  (table) => [
    primaryKey({ columns: [table.mt_task_id, table.effect_id] }),
    index("task_execution_effect_state_idx").on(table.mt_task_id, table.state),
  ],
)
