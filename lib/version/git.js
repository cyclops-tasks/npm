export function commit({ event, events }) {
  return events.gitCommit({
    ...event.options,
    message: "Version bump",
  })
}

export function status({ event, events }) {
  return events.gitStatus(event.options)
}
