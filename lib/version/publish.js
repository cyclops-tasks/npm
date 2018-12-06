// Packages
import semver from "semver"

// Helpers
import { addDep } from "./deps"
import { status } from "./git"

export async function bumpPublishVersions(options) {
  const { events, props, publish } = options

  const { npmInstall, operations } = events.get(props)
  const { force } = events.get("argv.opts")

  if (operations.version.publish === false) {
    return
  }

  const { behind, dirty, needsPublish } = await status(
    options
  )

  const publishOk =
    !dirty &&
    !behind &&
    (needsPublish || npmInstall || force)

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
