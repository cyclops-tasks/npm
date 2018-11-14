import buildGraph from "toposort"

export async function addGraph({ store, taskId }) {
  const task = store.get(`cyclops.tasks.${taskId}`)
  const { name, links } = task

  await store.set(
    `cyclops.tasks.${taskId}.graph`,
    linksToGraph({ links, name })
  )
}

export function linksToGraph({ links = [], name }) {
  return Object.keys(links)
    .map(linkName => [name, linkName])
    .concat([[name, ""]])
}

export async function linkGraph({ store, taskId }) {
  const task = store.get(`cyclops.tasks.${taskId}`)

  if (task.taskIndex > 0) {
    return
  }

  const taskIds = store.get("cyclops.taskIds")
  const tasks = store.get("cyclops.tasks")
  const graph = taskIds.reduce(
    (memo, id) => memo.concat(tasks[id].graph),
    []
  )

  await store.set("linkGraph", buildGraph(graph).reverse())
}
