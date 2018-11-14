import semver from "semver"

import { addDependency } from "./dependencies"

export async function bumpPublishVersions({
  store,
  taskId,
}) {
  const task = store.get(`cyclops.tasks.${taskId}`)

  const { gitBehind, gitDirty } = store.get(
    `spawn.${taskId}`
  )

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
      store.set(`cyclops.tasks.${taskId}.publish`, true),
      store.set(
        `cyclops.tasks.${taskId}.version`,
        newVersion
      ),
      addDependency({
        name,
        store,
        version: newVersion,
      }),
    ])
  }
}
