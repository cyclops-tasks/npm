import { h, Component } from "ink"
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
    const step = store.get("componentStep")

    return step === "status" ? (
      <StatusComponent events={events} store={store} />
    ) : (
      <SelectComponent events={events} store={store} />
    )
  }
}
