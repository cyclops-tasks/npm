// Helpers
export async function install(options) {
  const { events, props } = options

  const { npmInstall, projectPath } = events.get(props)

  if (npmInstall) {
    await events.spawn([...props, "spawnNpmInstall"], {
      args: ["install"],
      command: "npm",
      cwd: projectPath,
    })
  }
}

export async function publish(options) {
  const { events, props } = options
  const { projectPath, publish } = events.get(props)

  if (publish) {
    await events.spawn([...props, "spawnNpmPublish"], {
      args: ["publish"],
      command: "npm",
      cwd: projectPath,
    })
  }
}
