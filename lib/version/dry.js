export function dryMode({ events, store, taskId }) {
  const { taskLeader } = store.get(
    `cyclops.tasks.${taskId}`
  )

  if (!taskLeader || !store.get("argv.cyclops.dry")) {
    return
  }

  events.onAny(
    "before.spawn",
    async ({ command, event }) => {
      if (command !== "git") {
        event.signal.cancel = true
      }
    }
  )

  events.onAny("before.fs.writeJson", async ({ event }) => {
    event.signal.cancel = true
  })
}
