// Packages
import { readJson } from "fs-extra"

// Helpers
import { propsFn } from "./props"

export async function readPackageJson(options) {
  const { store, task } = options
  const { projectPkgPath } = task

  const props = propsFn(options)

  const {
    dependencies = {},
    devDependencies = {},
    links,
    name,
    version,
  } = await readJson(projectPkgPath)

  await store.merge(props(), {
    dependencies,
    devDependencies,
    links,
    name,
    version,
  })
}
