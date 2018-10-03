export async function waitForAll({ store, taskId }) {
  const id = this
  const get = store.get.bind(undefined, `wait.${id}`)

  await store.set(`wait.${id}`, () => (get() || 0) + 1)

  const ok =
    get() === store.get(`tasks.${taskId}`).taskCount

  if (ok) {
    await store.emit(id + "Ready")
  } else {
    await new Promise(resolve =>
      store.onEmitted(id + "Ready", resolve)
    )
  }
}
