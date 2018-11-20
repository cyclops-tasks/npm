// Packages
import semver from "semver"

// Helpers
import { addDep } from "./deps"
import { status } from "./git"
import { propsFn } from "./props"

export async function bumpPublishVersions(options) {
  const { publish, store } = options
  const { force } = store.get("argv.opts")
  const props = propsFn(options)

  await status(options)

  const { behind, dirty, needsPublish } = store.get(
    props("gitStatus")
  )

  const publishOk =
    !dirty.result &&
    !behind.result &&
    (needsPublish.result || force)

  if (publishOk) {
    const { name, version } = store.get(props())
    const newVersion = semver.inc(
      version,
      publish === true ? "patch" : publish
    )

    await Promise.all([
      store.set(props("publish"), true),
      store.set(props("version"), newVersion),
      addDep({
        name,
        store,
        version: newVersion,
      }),
    ])
  }
}
