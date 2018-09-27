import spawnComposer from "@dot-store/spawn"
import { readJson } from "fs-extra"
import depGraph from "toposort"

import { component } from "./component"

export default async function(store) {
  spawnComposer(store)

  store.sync().on({
    startTasks: [
      phase(init),
      phase(dependencyGraph),
      phase(gitDirty),
    ],
  })

  return store
}

function phase(fn) {
  return async options => {
    const { taskIds, tasks } = options

    await Promise.all(
      taskIds.map(
        async taskId =>
          await fn({
            ...options,
            task: tasks[taskId],
            taskId,
          })
      )
    )
  }
}

export async function init({ store, task, taskId }) {
  const { links, name } = await readJson(
    task.projectPkgPath
  )

  await store.emit(
    "Component",
    component.bind({ ...task, name })
  )

  const graph = Object.keys(links).map(linkName => [
    name,
    linkName,
  ])

  await store.merge(`tasks.${taskId}`, {
    graph,
    links,
    name,
    status: `Found ${graph.length} links`,
  })
}

export async function gitDirty({ store, task, taskId }) {
  await store.spawn(
    `tasks.${taskId}.gitDirty`,
    "git",
    "diff-index",
    "--quiet",
    "HEAD",
    "--",
    { cwd: task.projectPath }
  )
}

export async function dependencyGraph({
  store,
  task,
  taskIds,
}) {
  const { taskLeader } = task

  if (taskLeader) {
    const tasks = store.get("tasks")
    const graph = taskIds.reduce(
      (memo, id) => memo.concat(tasks[id].graph),
      []
    )
    await store.set(
      "taskLinkOrder",
      depGraph(graph).reverse()
    )
  }
}
