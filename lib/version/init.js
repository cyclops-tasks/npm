import { readJson } from "fs-extra"

export async function readPackageJson({ store, taskId }) {
  const { projectPkgPath } = store.get(
    `cyclops.tasks.${taskId}`
  )

  const {
    dependencies = {},
    devDependencies = {},
    links,
    name,
    version,
  } = await readJson(projectPkgPath)

  await store.merge(`cyclops.tasks.${taskId}`, {
    dependencies,
    devDependencies,
    links,
    name,
    version,
  })
}
