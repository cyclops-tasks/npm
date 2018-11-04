import { h, render } from "ink"
import { StatusComponent } from "./components/StatusComponent"

export async function component({ events, store, taskId }) {
  const { taskLeader } = store.get(`tasks.${taskId}`)

  if (!taskLeader || process.env.NODE_ENV === "test") {
    return
  }

  const unmount = render(
    <StatusComponent events={events} store={store} />
  )
  events.once("emit.unmount", unmount)
}
