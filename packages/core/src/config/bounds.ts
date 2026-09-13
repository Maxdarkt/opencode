export * as ConfigBounds from "./bounds"

import { Schema } from "effect"
import { PositiveInt } from "../schema"

export const DEFAULT_STEPS = 50
export const DEFAULT_DURATION_MS = 1_800_000

export class Info extends Schema.Class<Info>("ConfigV2.Bounds")({
  steps: PositiveInt.pipe(Schema.optional),
  tokens: PositiveInt.pipe(Schema.optional),
  duration_ms: PositiveInt.pipe(Schema.optional),
}) {}
