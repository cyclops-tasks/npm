// Packages
import { readJson } from "fs-extra"
import semver from "semver"

// Helpers
export async function addDeps(options) {
  const { events, props } = options
  const { deps, devDeps, name, version } = events.get(props)

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
  const { events, name, version } = options

  if (!name || !version) {
    return
  }

  await events.set(["deps", name], () => {
    const current = fixDep(events.get(["deps", name]))

    return fixDep(
      semver.gt(current, version) ? current : version
    )
  })
}

export async function syncDeps(options) {
  const { events, props } = options
  const { projectPkgPath } = events.get(props)

  const json = await readJson(projectPkgPath)

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

  await events.fsWriteJson([...props, "syncDeps"], {
    json,
    path: projectPkgPath,
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
  const { deps, events, props } = options

  if (!deps) {
    return
  }

  const { npmInstall } = events.get(props)

  for (const name of Object.keys(deps)) {
    const newestVersion = events.get(["deps", name])
    const version = deps[name]

    if (newestVersion && newestVersion !== version) {
      deps[name] = newestVersion
      if (!npmInstall) {
        await events.set([...props, "npmInstall"], true)
      }
    }
  }
}

export function refreshVersion(options) {
  const { events, json } = options
  const { name, version } = json

  const newestVersion = events.get(["deps", name])

  if (newestVersion && newestVersion !== version) {
    json.version = newestVersion
  }
}
