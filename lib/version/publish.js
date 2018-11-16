// Packages
import semver from "semver"

// Helpers
import { addDep } from "./deps"
import { propsFn } from "./props"

export async function bumpPublishVersions(options) {
  const { event, events, publish, store } = options
  const props = propsFn(options)

  await events.git({
    ...event.options,
    status: true,
  })

  const { behind, dirty, needsPublish } = store.get(
    props("gitStatus")
  )

  const publishOk =
    !dirty.result && !behind.result && needsPublish.result

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
