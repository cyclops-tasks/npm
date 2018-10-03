import buildGraph from "toposort"

export async function addGraph({ store, taskId }) {
  const task = store.get(`tasks.${taskId}`)
  const { name, links } = task

  await store.set(
    `tasks.${taskId}.graph`,
    linksToGraph({ links, name })
  )
}

export function linksToGraph({ links = [], name }) {
  return Object.keys(links)
    .map(linkName => [name, linkName])
    .concat([[name, ""]])
}

export async function linkGraph({ store, taskId }) {
  const task = store.get(`tasks.${taskId}`)

  if (!task.taskLeader) {
    return
  }

  const taskIds = store.get("taskIds")
  const tasks = store.get("tasks")
  const graph = taskIds.reduce(
    (memo, id) => memo.concat(tasks[id].graph),
    []
  )

  await store.set("linkGraph", buildGraph(graph).reverse())
}
