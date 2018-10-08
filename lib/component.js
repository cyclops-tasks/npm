import { h, render } from "ink"
import { StepComponent } from "./components/StepComponent"

export async function component({ store, taskId }) {
  const { taskLeader } = store.get(`tasks.${taskId}`)

  if (!taskLeader || process.env.NODE_ENV === "test") {
    return
  }

  const unmount = render(<StepComponent store={store} />)

  await Promise.all([
    store.once("selectComponent.onSubmit", selectOnSubmit),
    store.once("unmount", unmount),
  ])
}

async function selectOnSubmit({ event, store }) {
  const argv = event.argv[0].reduce((memo, key) => {
    memo[key] = true
    return memo
  }, {})

  await store.merge("argv", argv)
  await store.set("componentStep", "status")
}
