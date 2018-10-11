export function phase(id) {
  return waitForAll.bind(id)
}

async function waitForAll({ events, store }) {
  const id = this
  const get = store.get.bind(undefined, `phase.${id}`)
  const taskCount = store.get("taskCount")

  await store.set(`phase.${id}`, () => (get() || 0) + 1)

  const ok = get() === taskCount

  if (ok) {
    await events.emit(`${id}.ready`)
  } else {
    await events.onceEmitted(`emit.${id}.ready`)
  }
}
