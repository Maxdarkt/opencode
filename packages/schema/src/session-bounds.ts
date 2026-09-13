export * as SessionBounds from "./session-bounds"

import { Schema } from "effect"
import { Event } from "./event"
import { DateTimeUtcFromMillis } from "./schema"
import { SessionID } from "./session-id"

export const StopReason = Schema.Literals(["interrupt", "steps", "budget", "timeout"]).annotate({
  identifier: "SessionBounds.StopReason",
})
export type StopReason = typeof StopReason.Type

/** Live-only: the drain stopped on a bound. Natural idle does not emit this. */
export const DrainEnded = Event.define({
  type: "session.next.drain.ended",
  schema: {
    sessionID: SessionID,
    timestamp: DateTimeUtcFromMillis,
    reason: StopReason,
  },
})
export type DrainEnded = typeof DrainEnded.Type
