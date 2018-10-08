export function waitForAll(id) {
  return waitForAllFn.bind(id)
}

async function waitForAllFn({ store }) {
  const id = this
  const get = store.get.bind(undefined, `wait.${id}`)
  const taskCount = store.get("taskCount")

  await Promise.all([
    store.set("phases", () =>
      (store.get("phases") || []).concat(id)
    ),
    store.set(`wait.${id}`, () => (get() || 0) + 1),
  ])

  const ok = get() === taskCount

  if (ok) {
    await store.emit(id + "Ready")
  } else {
    await new Promise(resolve =>
      store.onEmitted(id + "Ready", resolve)
    )
  }
}
