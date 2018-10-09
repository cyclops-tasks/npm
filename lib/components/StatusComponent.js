import { h, Component, Text } from "ink"
import Spinner from "ink-spinner"

import { spaceStr } from "../spaceStr"

export class StatusComponent extends Component {
  constructor(props, context) {
    super(props, context)
    this.space = spaceStr.bind({ store: props.store })
  }

  componentDidMount() {
    this.off = this.props.store.onAnyEmitted(
      "phase",
      () => {
        this.setState({ random: Math.random() })
      }
    )

    this.spaceOff = this.props.store
      .withOp("set")
      .onAnyEmitted("space", () => {
        this.setState({ random: Math.random() })
      })
  }

  componentWillUnmount() {
    this.off()
    this.spaceOff()
  }

  render() {
    const { store } = this.props
    const phases = store.get("phase")
    const taskCount = store.get("taskCount")

    return (
      <div>
        {Object.keys(phases).map(phase => {
          const count = phases[phase]
          return (
            <div key={phase}>
              {taskCount === count ? (
                <Text green>{"✓"}</Text>
              ) : (
                <Spinner yellow />
              )}{" "}
              {this.space("phase", phase)}
              {`(${count} of ${taskCount})`}
            </div>
          )
        })}
      </div>
    )
  }
}
