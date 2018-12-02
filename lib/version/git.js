export function commit(options) {
  const { event, events, props } = options
  const { npmInstall, publish } = events.get(props)

  if (npmInstall || publish) {
    return events.gitCommit(props, {
      ...event.options,
      message: "Version bump",
    })
  }
}

export function status({ event, props, events }) {
  return events.gitStatus(props, event.options)
}
