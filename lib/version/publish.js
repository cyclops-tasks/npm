// Packages
import semver from "semver"

// Helpers
import { addDep } from "./deps"
import { status } from "./git"

export async function bumpPublishVersions(options) {
  const { ns, publish, store } = options
  const { force } = store.get("argv.opts")

  await status(options)

  const { behind, dirty, needsPublish } = store.get([
    ...ns,
    "gitStatus",
  ])

  const publishOk =
    !dirty.result &&
    !behind.result &&
    (needsPublish.result || force)

  if (publishOk) {
    const { name, version } = store.get(ns)
    const newVersion = semver.inc(
      version,
      publish === true ? "patch" : publish
    )

    await Promise.all([
      store.set([...ns, "publish"], true),
      store.set([...ns, "version"], newVersion),
      addDep({
        name,
        store,
        version: newVersion,
      }),
    ])
  }
}
