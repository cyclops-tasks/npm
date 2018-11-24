// Packages
import { readJson } from "fs-extra"

// Helpers
export async function readPackageJson(options) {
  const { props, store } = options
  const { projectPkgPath } = store.get(props)

  const {
    dependencies = {},
    devDependencies = {},
    links,
    name,
    version,
  } = await readJson(projectPkgPath)

  await store.merge(props, {
    deps: dependencies,
    devDeps: devDependencies,
    links,
    name,
    version,
  })
}
