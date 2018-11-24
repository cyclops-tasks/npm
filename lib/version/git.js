export function commit({ event, events, props }) {
  return events.gitCommit(props, {
    ...event.options,
    message: "Version bump",
  })
}

export function status({ event, props, events }) {
  return events.gitStatus(props, event.options)
}
