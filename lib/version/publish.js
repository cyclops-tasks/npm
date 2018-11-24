// Packages
import semver from "semver"

// Helpers
import { addDep } from "./deps"
import { status } from "./git"

export async function bumpPublishVersions(options) {
  const { props, publish, store } = options
  const { force } = store.get("argv.opts")

  await status(options)

  const { behind, dirty, needsPublish } = store.get([
    ...props,
    "gitStatus",
  ])

  const publishOk =
    !dirty.result &&
    !behind.result &&
    (needsPublish.result || force)

  if (publishOk) {
    const { name, version } = store.get(props)
    const newVersion = semver.inc(
      version,
      publish === true ? "patch" : publish
    )

    await Promise.all([
      store.set([...props, "publish"], true),
      store.set([...props, "version"], newVersion),
      addDep({
        name,
        store,
        version: newVersion,
      }),
    ])
  }
}
