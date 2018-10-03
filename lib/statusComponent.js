import { spaceStr } from "./spaceStr"

export const phases = [
  {
    desc: "Read variables from package.json",
    phase: "init",
  },
  {
    desc: "Build link dependency graph",
    phase: "dependencyGraph",
  },
  {
    desc: "Check if git repo is dirty",
    phase: "gitDirty",
  },
]

export async function addStatusComponent({
  store,
  taskId,
}) {
  await store.emit(
    "Component.add",
    statusComponent.bind({ taskId })
  )
}

export function statusComponent({
  h,
  Component,
  Spinner,
  Text,
  store,
}) {
  const { taskId } = this
  const { taskCount } = store.get(`tasks.${taskId}`)
  const space = spaceStr.bind({ store })

  class Npm extends Component {
    componentDidMount() {
      this.off = store.onAnyEmitted(
        "completeTasks.{phase}",
        () => {
          this.setState({ random: Math.random() })
        }
      )

      this.spaceOff = store.onEmitted("space", () => {
        const space = store.get("space")
        this.setState({ space })
      })
    }

    componentWillUnmount() {
      this.off()
      this.spaceOff()
    }

    render() {
      const phaseCounts = phases.map(({ phase, desc }) => {
        const tasks = store.get(`completeTasks.${phase}`)
        const count = tasks ? Object.keys(tasks).length : 0
        return { count, desc, phase }
      })

      return (
        <div>
          {phaseCounts.map(({ count, desc, phase }) => {
            return (
              <div key={phase}>
                {taskCount === count ? (
                  <Text green>{"✓"}</Text>
                ) : (
                  <Spinner yellow />
                )}{" "}
                {space("desc", desc)}
                {`(${count} of ${taskCount})`}
              </div>
            )
          })}
        </div>
      )
    }
  }

  return <Npm />
}
