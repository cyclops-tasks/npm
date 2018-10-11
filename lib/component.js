import { h, render } from "ink"
import { StepComponent } from "./components/StepComponent"

export async function component({ events, store, taskId }) {
  const { taskLeader } = store.get(`tasks.${taskId}`)

  if (!taskLeader || process.env.NODE_ENV === "test") {
    return
  }

  const unmount = render(
    <StepComponent events={events} store={store} />
  )
  events.once("emit.unmount", unmount)

  await events.once(
    "emit.selectComponent.onSubmit",
    selectOnSubmit
  )
}

async function selectOnSubmit({ event, store }) {
  const argv = event.args[0].reduce((memo, key) => {
    memo[key] = true
    return memo
  }, {})

  await store.merge("argv", argv)
  await store.set("componentStep", "status")
}
