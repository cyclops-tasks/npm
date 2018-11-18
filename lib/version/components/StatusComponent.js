import { h, Component, Text } from "ink"
import Spinner from "ink-spinner"

import { spaceStr } from "../spaceStr"

export class StatusComponent extends Component {
  constructor(props, context) {
    super(props, context)
    this.space = spaceStr.bind({ store: props.store })
  }

  componentDidMount() {
    const forceUpdate = () => {
      this.setState({ random: Math.random() })
    }

    this.off = this.props.events.onAnyEmitted({
      "store.phase": forceUpdate,
      "store.space": forceUpdate,
    })
  }

  componentWillUnmount() {
    this.off()
  }

  render() {
    const { store } = this.props
    const phases = store.get("phase")
    const taskCount = store.get("task.taskCount")

    return (
      <div>
        {Object.keys(phases).map(phase => {
          const { count, title } = phases[phase]
          return (
            <div key={phase}>
              {taskCount === count ? (
                <Text green>{"✓"}</Text>
              ) : (
                <Spinner yellow />
              )}{" "}
              {this.space("phase", title)}
              {`(${count} of ${taskCount})`}
            </div>
          )
        })}
      </div>
    )
  }
}
