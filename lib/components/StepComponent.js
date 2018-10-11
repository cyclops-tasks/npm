import { h, Component } from "ink"
import { DryComponent } from "./DryComponent"
import { SelectComponent } from "./SelectComponent"
import { StatusComponent } from "./StatusComponent"

export class StepComponent extends Component {
  componentDidMount() {
    const forceUpdate = () => {
      this.setState({ random: Math.random() })
    }

    this.props.events.onEmitted(
      "store.componentStep",
      forceUpdate
    )
  }

  render() {
    const { events, store } = this.props

    const dry = store.get("argv.dry")
    const step = store.get("componentStep")

    return step === "status" ? (
      <div>
        <StatusComponent events={events} store={store} />
        {dry ? (
          <DryComponent events={events} store={store} />
        ) : (
          ""
        )}
      </div>
    ) : (
      <SelectComponent events={events} store={store} />
    )
  }
}
