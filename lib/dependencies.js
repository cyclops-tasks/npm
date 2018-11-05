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
    return fixDep(
      semver.gt(current, version) ? current : version
    )
  })
}

export async function installDependencies({
  events,
  store,
  taskId,
}) {
  const { npmInstall, projectPath } = store.get(
    `tasks.${taskId}`
  )

  if (npmInstall) {
    await events.spawn(`tasks.${taskId}.install`, {
      args: ["install"],
      command: "npm",
      options: { cwd: projectPath },
    })
  }
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
    options: { spaces: 2 },
    path: task.projectPkgPath,
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

    if (newestVersion && newestVersion !== version) {
      dependencies[name] = newestVersion
      if (!npmInstall) {
        await store.set(`tasks.${taskId}.npmInstall`, true)
      }
    }
  }
}

export function refreshVersion({ json, store }) {
  const { name, version } = json
  const newestVersion = store.get(`deps.${name}`)

  if (newestVersion && newestVersion !== version) {
    json.version = newestVersion
  }
}
