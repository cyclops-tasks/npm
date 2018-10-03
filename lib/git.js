export async function gitBehind({ store, taskId }) {
  const { projectPath } = store.get(`tasks.${taskId}`)

  await store.spawn(
    `tasks.${taskId}.gitBehind`,
    "git",
    "status",
    "-uno",
    { cwd: projectPath }
  )
}

export async function gitDirty({ store, taskId }) {
  const { projectPath } = store.get(`tasks.${taskId}`)

  await store.spawn(
    `tasks.${taskId}.gitDirty`,
    "git",
    "diff-index",
    "--quiet",
    "HEAD",
    "--",
    { cwd: projectPath }
  )
}
