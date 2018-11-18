export function dryMode({ events, store }) {
  if (!store.get("arg.dry")) {
    return
  }

  events.onAny({
    "before.fs": async ({ event }) => {
      event.signal.cancel = true
    },
    "before.spawn": async ({ command, event }) => {
      if (command !== "git") {
        event.signal.cancel = true
      }
    },
  })
}
