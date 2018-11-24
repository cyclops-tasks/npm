export function dryMode({ events, store }) {
  if (!store.get("argv.opts.dry")) {
    return
  }

  events.onAny({
    "before.fsWriteJson": async ({ event }) => {
      event.signal.cancel = true
    },
    "before.spawn": async ({ command, event }) => {
      if (command !== "git") {
        event.signal.cancel = true
      }
    },
  })
}
