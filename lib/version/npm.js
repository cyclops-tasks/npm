// Helpers
export async function install(options) {
  const { events, ns, store } = options

  const { npmInstall, projectPath } = store.get(ns)

  if (npmInstall) {
    await events.spawn([...ns, "spawnNpmInstall"], {
      args: ["install"],
      command: "npm",
      cwd: projectPath,
    })
  }
}

export async function publish(options) {
  const { events, ns, store } = options
  const { projectPath, publish } = store.get(ns)

  if (publish) {
    await events.spawn([...ns, "spawnNpmPublish"], {
      args: ["publish"],
      command: "npm",
      cwd: projectPath,
    })
  }
}
