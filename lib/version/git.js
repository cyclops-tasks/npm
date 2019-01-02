export async function commit(options) {
  const { event, events, props } = options
  const { bumped, ignore, matched } = events.get(props)

  if (ignore) {
    return
  }

  if (bumped || matched) {
    await events.gitCommit(props, {
      ...event.options,
      message: "Version bump",
    })
  }
}

export function status({ event, props, events }) {
  return events.gitStatus(props, event.options)
}
