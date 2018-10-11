export function dryMode({ events, store, taskId }) {
  const { taskLeader } = store.get(`tasks.${taskId}`)

  if (!taskLeader || !store.get("argv.dry")) {
    return
  }

  events.onAny("before.spawn", ({ command, event }) => {
    if (command !== "git") {
      event.signal.cancel = true
      store.set("spawns", ({ get }) =>
        (get("spawns") || []).concat([event])
      )
    }
  })
}
