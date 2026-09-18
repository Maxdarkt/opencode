export * as MakeDev from "./make-dev"

import { Schema } from "effect"
import { NonNegativeInt, optional, PositiveInt } from "./schema"

export const State = Schema.Literals(["off", "on", "unknown"])
export type State = typeof State.Type

export interface Status extends Schema.Schema.Type<typeof Status> {}
export const Status = Schema.Struct({
  state: State,
  host: Schema.String.pipe(optional),
  backendPort: PositiveInt.pipe(optional),
  uiPort: PositiveInt.pipe(optional),
  worktreeCode: NonNegativeInt.pipe(optional),
  error: Schema.String.pipe(optional),
}).annotate({ identifier: "MakeDev.Status" })
