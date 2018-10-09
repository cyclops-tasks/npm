export function phase(id) {
  return waitForAll.bind(id)
}

async function waitForAll({ store }) {
  const id = this
  const get = store.get.bind(undefined, `phase.${id}`)
  const taskCount = store.get("taskCount")

  await store.set(`phase.${id}`, () => (get() || 0) + 1)

  const ok = get() === taskCount

  if (ok) {
    await store.emit(id + "Ready")
  } else {
    await store.onceEmitted(id + "Ready")
  }
}
