// Helpers
import { propsFn } from "./props"

export async function install(options) {
  const { events, store } = options
  const props = propsFn(options)

  const { npmInstall, projectPath } = store.get(props())

  if (npmInstall) {
    await events.spawn(props("spawnNpmInstall"), {
      args: ["install"],
      command: "npm",
      cwd: projectPath,
    })
  }
}

export async function publish(options) {
  const { events, store } = options
  const props = propsFn(options)

  const { projectPath, publish } = store.get(props())

  if (publish) {
    await events.spawn(props("spawnNpmPublish"), {
      args: ["publish"],
      command: "npm",
      cwd: projectPath,
    })
  }
}
