import { h, render } from "ink"
import { StatusComponent } from "./components/StatusComponent"

export async function component({ events, props }) {
  const { taskIndex } = events.get(props)

  if (taskIndex > 0 || process.env.NODE_ENV === "test") {
    return
  }

  const unmount = render(
    <StatusComponent events={events} />
  )
  events.once("emit.unmount", () => setTimeout(unmount, 10))
}
