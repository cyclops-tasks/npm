import { spaceStr } from "./spaceStr"

export function component({
  h,
  Component,
  Spinner,
  Text,
  TextAnimation,
  store,
}) {
  const { name, taskId, taskLeader } = this
  const space = spaceStr.bind({ store })

  class Npm extends Component {
    constructor(props, context) {
      super(props, context)
      this.state = { name, taskLeader }
    }

    componentDidMount() {
      this.off = store.onAnyEmitted(
        `tasks.${taskId}`,
        () => {
          const { complete, status } = store.get(
            `tasks.${taskId}`
          )
          this.setState({ complete, status })
        }
      )

      this.spaceOff = store.onAnyEmitted("space", () => {
        const space = store.get("space")
        this.setState({ space })
      })
    }

    componentWillUnmount() {
      this.off()
      this.spaceOff()
    }

    render() {
      const { complete, status, taskLeader } = this.state

      return (
        <div>
          {taskLeader ? (
            <TextAnimation name="pulse">
              <Text>{space("leader", "Leader")}</Text>
            </TextAnimation>
          ) : (
            space("leader")
          )}
          {complete ? (
            <Text green>{"✓"}</Text>
          ) : (
            <Spinner />
          )}{" "}
          {space("name", name)}
          {status || ""}
        </div>
      )
    }
  }

  return <Npm />
}
