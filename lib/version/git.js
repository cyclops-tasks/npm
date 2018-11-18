export function commit({ event, events }) {
  return events.git({
    ...event.options,
    action: "commit",
    message: "Version bump",
  })
}

export function status({ event, events }) {
  return events.git({
    ...event.options,
    action: "status",
  })
}
