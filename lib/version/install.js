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
      options: { cwd: projectPath },
    })
  }
}
