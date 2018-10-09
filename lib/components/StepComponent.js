import { h, Component } from "ink"
import { DryComponent } from "./DryComponent"
import { SelectComponent } from "./SelectComponent"
import { StatusComponent } from "./StatusComponent"

export class StepComponent extends Component {
  componentDidMount() {
    this.props.store
      .withOp("set")
      .onEmitted("componentStep", () => {
        this.setState({ random: Math.random() })
      })
  }

  render() {
    const { store } = this.props

    const dry = store.get("argv.dry")
    const step = store.get("componentStep")

    return step === "status" ? (
      <div>
        <StatusComponent store={store} />
        {dry ? <DryComponent store={store} /> : ""}
      </div>
    ) : (
      <SelectComponent store={store} />
    )
  }
}
