export function dryMode({ events, store, taskId }) {
  const { taskLeader } = store.get(`tasks.${taskId}`)

  if (!taskLeader || !store.get("argv.dry")) {
    return
  }

  events.onAny(
    "before.spawn",
    async ({ command, event }) => {
      if (command !== "git") {
        await log({ event, store })
      }
    }
  )

  events.onAny("before.fs.writeJson", async ({ event }) => {
    await log({ event, store })
  })
}

async function log({ event, store }) {
  event.signal.cancel = true
  await store.set("dryMode.log", ({ get }) =>
    (get("dryMode.log") || []).concat([
      `${event.op}.${event.props.join(".")}`,
    ])
  )
}
