// Packages
import { readJson } from "fs-extra"

// Helpers
export async function readPackageJson(options) {
  const { events, props } = options
  const { projectPkgPath } = events.get(props)

  const {
    dependencies = {},
    devDependencies = {},
    links,
    name,
    version,
  } = await readJson(projectPkgPath)

  await events.merge(props, {
    deps: dependencies,
    devDeps: devDependencies,
    links,
    name,
    version,
  })
}
