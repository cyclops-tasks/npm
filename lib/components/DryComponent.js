import { h, Component } from "ink"

export class DryComponent extends Component {
  constructor(props, context) {
    super(props, context)

    const { store } = props

    store.withOp("set").on("spawns", () => {
      this.setState({ random: Math.random() })
    })
  }

  render() {
    const spawns = this.props.store.get("spawns")
    if (spawns) {
      const out = spawns.map(event => {
        return event.args
          .map(
            a =>
              typeof a === "string" ? a : JSON.stringify(a)
          )
          .join(" ")
      })
      return <div>{out.join("\n")}</div>
    } else {
      return ""
    }
  }
}
