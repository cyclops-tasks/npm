import { readJson } from "fs-extra"

export async function readPackageJson({ store, taskId }) {
  const { projectPkgPath } = store.get(`tasks.${taskId}`)

  const {
    dependencies = {},
    devDependencies = {},
    links,
    name,
    version,
  } = await readJson(projectPkgPath)

  await store.merge(`tasks.${taskId}`, {
    dependencies,
    devDependencies,
    links,
    name,
    version,
  })
}
