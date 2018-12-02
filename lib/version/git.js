export function commit(options) {
  const { event, events, props } = options
  const { publish } = events.get(props)

  return events.gitCommit(props, {
    ...event.options,
    message: `Version ${publish ? "bump" : "match"}`,
  })
}

export function status({ event, props, events }) {
  return events.gitStatus(props, event.options)
}
