import { readJson } from "fs-extra"
import semver from "semver"

export async function addDependencies({ store, taskId }) {
  const selections = store.get("taskSelections")

  if (
    !selections.includes("all") &&
    !selections.includes("match")
  ) {
    return
  }

  const task = store.get(`tasks.${taskId}`)

  const {
    dependencies,
    devDependencies,
    name,
    version,
  } = task

  await addDependency({ name, store, version })

  const deps = Object.keys(dependencies).concat(
    Object.keys(devDependencies)
  )

  await Promise.all(
    deps.map(async dep => {
      const prod = fixDep(dependencies[dep])
      const dev = fixDep(devDependencies[dep])
      const version = semver.gt(prod, dev) ? prod : dev

      await addDependency({
        name: dep,
        store,
        version,
      })
    })
  )
}

export async function addDependency({
  name,
  store,
  version,
}) {
  if (!name || !version) {
    return
  }

  await store.set(`deps.${name}`, () => {
    const current = fixDep(store.get(`deps.${name}`))
    return semver.gt(current, version)
      ? current
      : fixDep(version)
  })
}

export async function installDependencies({
  store,
  taskId,
}) {
  const { projectPath } = store.get(`tasks.${taskId}`)

  await store.spawn(
    `tasks.${taskId}.install`,
    "npm",
    "install",
    { cwd: projectPath }
  )
}

export async function syncDependenciesForMatch({
  store,
  taskId,
}) {
  const selections = store.get("taskSelections")

  if (
    !selections.includes("all") &&
    !selections.includes("match")
  ) {
    return
  }

  await syncDependencies({ store, taskId })
}

export async function syncDependenciesForPublish({
  store,
  taskId,
}) {
  const selections = store.get("taskSelections")

  if (
    !selections.includes("all") &&
    !selections.includes("publish")
  ) {
    return
  }

  await syncDependencies({ store, taskId })
}

export async function syncDependencies({ store, taskId }) {
  const task = store.get(`tasks.${taskId}`)
  const json = await readJson(task.projectPkgPath)

  refreshVersion({ json, store })

  await Promise.all([
    refreshDependencies({
      dependencies: json.dependencies,
      store,
      taskId,
    }),

    refreshDependencies({
      dependencies: json.devDependencies,
      store,
      taskId,
    }),
  ])

  await store.emit("writeJson", task.projectPkgPath, json)
}

function fixDep(dep) {
  return dep ? semver.coerce(dep).version : "0.0.0"
}

export async function refreshDependencies({
  dependencies,
  store,
  taskId,
}) {
  if (!dependencies) {
    return
  }
  for (const name of Object.keys(dependencies)) {
    const { npmInstall } = store.get(`tasks.${taskId}`)
    const newestVersion = store.get(`deps.${name}`)
    const version = dependencies[name]

    if (newestVersion !== version && !npmInstall) {
      await store.set(`tasks.${taskId}.npmInstall`, true)
    }

    dependencies[name] = newestVersion || version
  }
}

export function refreshVersion({ json, store }) {
  const { name, version } = json
  const newestVersion = store.get(`deps.${name}`)

  if (newestVersion && newestVersion !== version) {
    json.version = newestVersion
  }
}
