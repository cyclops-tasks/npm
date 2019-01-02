// Helpers
export async function publish(options) {
  const { events, props } = options

  const {
    bumped,
    ignore,
    projectPath,
    publish,
  } = events.get(props)

  if (ignore) {
    return
  }

  if (bumped && publish) {
    await events.spawn([...props, "spawnNpmPublish"], {
      args: ["publish"],
      command: "npm",
      cwd: projectPath,
    })
  }
}
