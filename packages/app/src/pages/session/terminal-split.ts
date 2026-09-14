export type TerminalSplitPane = { kind: "pty"; id: string } | { kind: "unknown" }

export async function openTerminalSplit(input: {
  existingIds: readonly string[]
  create: () => Promise<string | undefined>
}): Promise<readonly [TerminalSplitPane, TerminalSplitPane]> {
  const firstId = input.existingIds[0] ?? (await input.create())
  const secondId = await input.create()
  return [
    firstId ? { kind: "pty", id: firstId } : { kind: "unknown" },
    secondId ? { kind: "pty", id: secondId } : { kind: "unknown" },
  ]
}
