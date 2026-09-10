export function createProjectOpening<Server, Project>(input: {
  read: (server: Server, directory: string) => Promise<Project>
  commit: (server: Server, directory: string, project: Project) => void
  select: (server: Server, directory: string) => void
  error: (server: Server, directory: string, cause: unknown) => void
}) {
  let generation = 0
  return {
    cancel() {
      generation++
    },
    async open(server: Server, directories: string[]) {
      const token = ++generation
      const unique = [...new Set(directories.filter(Boolean))]
      const results = await Promise.allSettled(unique.map((directory) => input.read(server, directory)))
      if (token !== generation) return
      const opened = results.flatMap((result, index) => {
        const directory = unique[index]
        if (result.status === "rejected") {
          input.error(server, directory, result.reason)
          return []
        }
        input.commit(server, directory, result.value)
        return [directory]
      })
      if (opened[0]) input.select(server, opened[0])
    },
  }
}
