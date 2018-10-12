import { readJson } from "fs-extra"
import semver from "semver"

export async function addDependencies({ store, taskId }) {
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
  events,
  store,
  taskId,
}) {
  const { projectPath } = store.get(`tasks.${taskId}`)

  await events.spawn(`tasks.${taskId}.install`, {
    args: ["install"],
    command: "npm",
    options: { cwd: projectPath },
  })
}

export async function syncDependencies({
  events,
  store,
  taskId,
}) {
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

  await events.fs(`writeJson.${taskId}`, {
    json,
    path: task.projectPkgPath,
  })
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
