export async function gitBehind({ events, store, taskId }) {
  const { projectPath } = store.get(
    `cyclops.tasks.${taskId}`
  )

  await events.spawn(`${taskId}.gitBehind`, {
    args: ["status", "-uno"],
    command: "git",
    options: { cwd: projectPath },
  })
}

export async function gitDirty({ events, store, taskId }) {
  const { projectPath } = store.get(
    `cyclops.tasks.${taskId}`
  )

  await events.spawn(`${taskId}.gitDirty`, {
    args: ["diff-index", "--quiet", "HEAD", "--"],
    command: "git",
    options: { cwd: projectPath },
  })
}
