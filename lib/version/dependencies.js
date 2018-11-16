// Packages
import { readJson } from "fs-extra"
import semver from "semver"

// Helpers
import { propsFn } from "./props"

export async function addDependencies(options) {
  const { store } = options
  const props = propsFn(options)

  const {
    dependencies,
    devDependencies,
    name,
    version,
  } = store.get(props())

  await addDependency({ ...options, name, version })

  const deps = Object.keys(dependencies).concat(
    Object.keys(devDependencies)
  )

  await Promise.all(
    deps.map(async dep => {
      const prod = fixDep(dependencies[dep])
      const dev = fixDep(devDependencies[dep])
      const version = semver.gt(prod, dev) ? prod : dev

      await addDependency({
        ...options,
        name: dep,
        version,
      })
    })
  )
}

export async function addDependency(options) {
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

export async function installDependencies(options) {
  const { events, store } = options
  const props = propsFn(options)

  const { npmInstall, projectPath } = store.get(props())

  if (npmInstall) {
    await events.spawn(props("spawnNpmInstall"), {
      args: ["install"],
      command: "npm",
      options: { cwd: projectPath },
    })
  }
}

export async function syncDependencies(options) {
  const { events, task } = options
  const json = await readJson(task.projectPkgPath)
  const props = propsFn(options)

  refreshVersion({ ...options, json })

  await Promise.all([
    refreshDependencies({
      ...options,
      dependencies: json.dependencies,
    }),

    refreshDependencies({
      ...options,
      dependencies: json.devDependencies,
    }),
  ])

  await events.fs(props("fsWriteJson"), {
    json,
    options: { spaces: 2 },
    path: task.projectPkgPath,
    writeJson: true,
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

export async function refreshDependencies(options) {
  const { dependencies, store } = options

  if (!dependencies) {
    return
  }

  const props = propsFn(options)
  const { npmInstall } = store.get(props())

  for (const name of Object.keys(dependencies)) {
    const newestVersion = store.get(["deps", name])
    const version = dependencies[name]

    if (newestVersion && newestVersion !== version) {
      dependencies[name] = newestVersion
      if (!npmInstall) {
        await store.set(props("npmInstall"), true)
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
