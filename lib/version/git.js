export function commit({ event, events }) {
  return events.git({
    ...event.options,
    all: true,
    commit: true,
    message: "Version bump",
    push: true,
  })
}

export function status({ event, events }) {
  return events.git({
    ...event.options,
    status: true,
  })
}
