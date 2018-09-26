import { readJson } from "fs-extra"
import depGraph from "toposort"

export default async function(options) {
  const { store, task, taskId, taskLeader } = options

  const { links, name } = await readJson(
    task.projectPkgPath
  )

  await store.emit(
    "Component",
    component.bind({ ...options, name })
  )

  const graph = Object.keys(links).map(linkName => [
    name,
    linkName,
  ])

  await store.merge(`tasks.${taskId}`, {
    graph,
    links,
    name,
    status: `Found ${graph.length} links`,
  })

  if (taskLeader) {
    store.onEmitted({ followerTasksComplete })
  }
}

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
      this.off = store.onEmitted(`tasks.${taskId}`, () => {
        const status = store.get(`tasks.${taskId}.status`)
        this.setState({ status })
      })

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
      const { status, taskLeader } = this.state

      return (
        <div>
          {taskLeader ? (
            <TextAnimation name="pulse">
              <Text>{space("leader", "[Leader]")}</Text>
            </TextAnimation>
          ) : (
            space("leader")
          )}
          <Spinner green /> {space("name", name)}
          {status || ""}
        </div>
      )
    }
  }

  return <Npm />
}

export async function followerTasksComplete({ store }) {
  const tasks = store.get("tasks")
  const graph = Object.keys(tasks).reduce(
    (memo, id) => memo.concat(tasks[id].graph),
    []
  )
  await store.set(
    "taskLinkOrder",
    depGraph(graph).reverse()
  )
}

function spaceStr(id, str = "") {
  const space = this.store.get(`space.${id}`)
  const newSpace = str.length + 2

  let finalSpace = space

  if (!space || newSpace > space) {
    this.store.set(`space.${id}`, newSpace)
    finalSpace = newSpace
  }

  const spaces = " ".repeat(
    finalSpace - str.length - (str ? 0 : 1)
  )

  return str + spaces
}
