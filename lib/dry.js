export function dryMode({ store, taskId }) {
  const { taskLeader } = store.get(`tasks.${taskId}`)

  if (!taskLeader || !store.get("argv.dry")) {
    return
  }

  store
    .before()
    .withOp("spawn")
    .onAny(({ event }) => {
      if (event.args[0] !== "git") {
        event.signal.cancel = true
        store.set("spawns", () =>
          (store.get("spawns") || []).concat([event])
        )
      }
    })
}
