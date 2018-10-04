import { spaceStr } from "./spaceStr"

export async function addSelectComponent({
  store,
  taskId,
}) {
  const task = store.get(`tasks.${taskId}`)
  const argv = Object.keys(store.get("argv"))

  if (
    !task.taskLeader ||
    argv.length > 1 ||
    process.env.EVENTS
  ) {
    return
  }

  await store.emit(
    "Component.add",
    selectComponent.bind({ taskId })
  )

  await new Promise(resolve =>
    store.withOp("set").onEmitted("taskSelections", resolve)
  )
}

export function selectComponent({
  h,
  Component,
  List,
  ListItem,
  store,
}) {
  const space = spaceStr.bind({ store })

  class Npm extends Component {
    componentDidMount() {
      this.spaceOff = store
        .withOp("set")
        .onAnyEmitted("space", () => {
          this.setState({ random: Math.random() })
        })
    }

    componentWillUnmount() {
      this.spaceOff()
    }

    render() {
      return (
        <List
          onSubmit={list =>
            store.merge(
              "argv",
              list.reduce((memo, key) => {
                memo[key] = true
                return memo
              }, {})
            )
          }
        >
          <ListItem value="symlink">
            {space("choice", "Symlink dependencies")}
            --link
          </ListItem>
          <ListItem value="match">
            {space("choice", "Match newest versions")}
            --match
          </ListItem>
          <ListItem value="publish">
            {space("choice", "Publish packages")}
            --publish
          </ListItem>
        </List>
      )
    }
  }

  return <Npm />
}
