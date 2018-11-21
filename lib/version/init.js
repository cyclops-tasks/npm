// Packages
import { readJson } from "fs-extra"

// Helpers
export async function readPackageJson(options) {
  const { ns, store, task } = options
  const { projectPkgPath } = task

  const {
    dependencies = {},
    devDependencies = {},
    links,
    name,
    version,
  } = await readJson(projectPkgPath)

  await store.merge(ns, {
    deps: dependencies,
    devDeps: devDependencies,
    links,
    name,
    version,
  })
}
