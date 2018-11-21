// Packages
import { readJson } from "fs-extra"
import semver from "semver"

// Helpers
export async function addDeps(options) {
  const { ns, store } = options
  const { deps, devDeps, name, version } = store.get(ns)

  await addDep({ ...options, name, version })

  const dependencies = Object.keys(deps).concat(
    Object.keys(devDeps)
  )

  await Promise.all(
    dependencies.map(async dep => {
      const prod = fixDep(deps[dep])
      const dev = fixDep(devDeps[dep])
      const version = semver.gt(prod, dev) ? prod : dev

      await addDep({
        ...options,
        name: dep,
        version,
      })
    })
  )
}

export async function addDep(options) {
  const { name, store, version } = options

  if (!name || !version) {
    return
  }

  await store.set(["deps", name], () => {
    const current = fixDep(store.get(["deps", name]))

    return fixDep(
      semver.gt(current, version) ? current : version
    )
  })
}

export async function syncDeps(options) {
  const { events, ns, task } = options
  const json = await readJson(task.projectPkgPath)

  refreshVersion({ ...options, json })

  await Promise.all([
    refreshDeps({
      ...options,
      deps: json.dependencies,
    }),

    refreshDeps({
      ...options,
      deps: json.devDependencies,
    }),
  ])

  await events.fs([...ns, "syncDeps"], {
    action: "writeJson",
    json,
    path: task.projectPkgPath,
    spaces: 2,
  })
}

function fixDep(dep) {
  return dep
    ? semver.coerce(dep).version + depHyphen(dep)
    : "0.0.0"
}

function depHyphen(dep) {
  return dep && dep.indexOf("-") > -1
    ? "-" + dep.split(/-/)[1]
    : ""
}

export async function refreshDeps(options) {
  const { deps, ns, store } = options

  if (!deps) {
    return
  }

  const { npmInstall } = store.get(ns)

  for (const name of Object.keys(deps)) {
    const newestVersion = store.get(["deps", name])
    const version = deps[name]

    if (newestVersion && newestVersion !== version) {
      deps[name] = newestVersion
      if (!npmInstall) {
        await store.set([...ns, "npmInstall"], true)
      }
    }
  }
}

export function refreshVersion(options) {
  const { json, store } = options
  const { name, version } = json

  const newestVersion = store.get(["deps", name])

  if (newestVersion && newestVersion !== version) {
    json.version = newestVersion
  }
}
