import { TaskPilot } from "@opencode-ai/core/task-pilot"
import { Effect, Schema } from "effect"
import { cmd } from "./cmd"
import { CliError, effectCmd } from "../effect-cmd"

const PilotCommand = effectCmd({
  command: "pilot",
  describe: "evaluate the next safe action for an observed APEX/MT task state",
  instance: false,
  builder: (yargs) =>
    yargs
      .option("mt-status", {
        choices: ["todo", "in_progress", "review", "done", "blocked"],
        demandOption: true,
        describe: "observed MT Tasks status",
        type: "string",
      })
      .option("apex-phase", {
        choices: ["analyze", "plan", "build", "smoke", "verify"],
        describe: "observed APEX phase",
        type: "string",
      })
      .option("context", {
        choices: ["concordant", "incomplete", "divergent", "resuming"],
        default: "concordant",
        describe: "observed task-context state",
        type: "string",
      }),
  handler: Effect.fn("Cli.task.pilot")(function* (args) {
    const input = yield* Schema.decodeUnknownEffect(TaskPilot.Input)(
      args.apexPhase === undefined
        ? { mtStatus: args.mtStatus, context: args.context }
        : { mtStatus: args.mtStatus, apexPhase: args.apexPhase, context: args.context },
    ).pipe(Effect.mapError(() => new CliError({ message: "Invalid pilot input" })))
    console.log(JSON.stringify(TaskPilot.evaluate(input)))
  }),
})

export const TaskCommand = cmd({
  command: "task",
  describe: "inspect local task-pilot decisions without changing task authorities",
  builder: (yargs) => yargs.command(PilotCommand).demandCommand(),
  async handler() {},
})
