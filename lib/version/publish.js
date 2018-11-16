// Packages
import semver from "semver"

// Helpers
import { addDep } from "./deps"
import { propsFn } from "./props"

export async function bumpPublishVersions(options) {
  const { store } = options
  const props = propsFn(options)

  const { behind, dirty } = store.get(
    props("gitStatus", "results")
  )

  if (!dirty && !behind) {
    const { name, version } = store.get(props())

    const newVersion = semver.inc(version, "patch")

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
