// Packages
import semver from "semver"

// Helpers
import { addDep } from "./deps"
import { status } from "./git"

export async function bumpPublishVersions(options) {
  const { events, props, publish } = options
  const { force } = events.get("argv.opts")

  await status(options)

  const { behind, dirty, needsPublish } = events.get([
    ...props,
    "gitStatus",
  ])

  const publishOk =
    !dirty.result &&
    !behind.result &&
    (needsPublish.result || force)

  if (publishOk) {
    const { name, version } = events.get(props)
    const newVersion = semver.inc(
      version,
      publish === true ? "patch" : publish
    )

    await Promise.all([
      events.set([...props, "publish"], true),
      events.set([...props, "version"], newVersion),
      addDep({
        ...options,
        name,
        version: newVersion,
      }),
    ])
  }
}
