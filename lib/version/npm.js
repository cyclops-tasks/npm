// Helpers
export async function publish(options) {
  const { events, props } = options
  const { ignore, projectPath, publish } = events.get(props)

  if (ignore) {
    return
  }

  if (publish) {
    await events.spawn([...props, "spawnNpmPublish"], {
      args: ["publish"],
      command: "npm",
      cwd: projectPath,
    })
  }
}
