export async function commit(options) {
  const { event, events, props } = options
  const { bumped, ignore } = events.get(props)

  if (ignore) {
    return
  }

  if (bumped) {
    await events.gitCommit(props, {
      ...event.options,
      message: "Version bump",
    })
  }
}

export function status({ event, props, events }) {
  return events.gitStatus(props, event.options)
}
