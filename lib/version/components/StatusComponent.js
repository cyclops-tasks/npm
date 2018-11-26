import { h, Component, Text } from "ink"
import Spinner from "ink-spinner"

import { spaceStr } from "../spaceStr"

export class StatusComponent extends Component {
  constructor(props, context) {
    super(props, context)
    this.space = spaceStr.bind({ events: props.events })
  }

  componentDidMount() {
    const forceUpdate = () => {
      this.setState({ random: Math.random() })
    }

    this.off = this.props.events.onAnyEmitted({
      "set.phase": forceUpdate,
      "set.space": forceUpdate,
    })
  }

  componentWillUnmount() {
    this.off()
  }

  render() {
    const { events } = this.props
    const phases = events.get("phase")
    const taskCount = events.get("task.taskCount")

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
