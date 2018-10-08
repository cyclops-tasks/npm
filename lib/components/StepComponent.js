import { h, Component } from "ink"
import { DryComponent } from "./DryComponent"
import { SelectComponent } from "./SelectComponent"
import { StatusComponent } from "./StatusComponent"

export class StepComponent extends Component {
  render() {
    const { store } = this.props

    const argv = Object.keys(store.get("argv"))
    const step = store.get("componentStep")

    return argv.indexOf("dry") > -1 ? (
      <DryComponent store={store} />
    ) : step === "status" || argv.length > 1 ? (
      <StatusComponent store={store} />
    ) : (
      <SelectComponent store={store} />
    )
  }
}
