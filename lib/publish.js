import semver from "semver"

import { addDependency } from "./dependencies"

export async function bumpPublishVersions({
  store,
  taskId,
}) {
  const task = store.get(`tasks.${taskId}`)
  const { gitDirty, gitBehind } = task

  const clean = gitDirty.code === 0
  const upToDate = !gitBehind.out.match(/(ahead|behind)/)

  if (clean && upToDate) {
    const { name, version } = task
    const release = store.get("taskSelections.publish")

    const newVersion = semver.inc(
      version,
      typeof release === "string" ? release : "patch"
    )

    await Promise.all([
      store.set(`tasks.${taskId}.publish`, true),
      store.set(`tasks.${taskId}.version`, newVersion),
      addDependency({
        name,
        store,
        version: newVersion,
      }),
    ])
  }
}
