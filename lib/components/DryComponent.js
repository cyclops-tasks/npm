import { h, Component } from "ink"

export class DryComponent extends Component {
  constructor(props, context) {
    super(props, context)

    const { store } = props

    this.state = { spawns: [] }

    store
      .before()
      .withOp("spawn")
      .on(({ event }) => {
        if (event.args[0] !== "git") {
          event.signal.cancel = true
        }
        this.setState("spawns", state => ({
          spawns: state.spawns.concat([event]),
        }))
      })
  }

  render() {
    const { spawns } = this.state
    return (
      <div>
        {spawns.map(e => JSON.stringify(e.args, null, 2))}
      </div>
    )
  }
}
