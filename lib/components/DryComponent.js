import { h, Component } from "ink"

export class DryComponent extends Component {
  constructor(props, context) {
    super(props, context)

    const { events } = props

    events.on("store.dryMode.log", () => {
      this.setState({ random: Math.random() })
    })
  }

  render() {
    const log = this.props.store.get("dryMode.log")
    if (log) {
      return log.join("\n\n")
    } else {
      return ""
    }
  }
}
