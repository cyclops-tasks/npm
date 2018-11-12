import dotEvent from "dot-event"
import dotStore from "dot-store"
import version from "../dist/version"

let events, store

beforeEach(async () => {
  events = dotEvent()
  store = dotStore(events)

  version({ events, store })

  await store.set("argv", { _: ["version"], all: true })

  const spawn = {
    gitBehind: { out: "" },
    gitDirty: { code: 0 },
  }

  await store.set("taskCount", 2)

  await store.set("tasks.project-a", {
    projectPath: `${__dirname}/fixture/project-a`,
    projectPkgPath: `${__dirname}/fixture/project-a/package.json`,
    taskId: "project-a",
    taskIndex: 0,
    taskLeader: true,
  })

  await store.set("tasks.project-b", {
    projectPath: `${__dirname}/fixture/project-b`,
    projectPkgPath: `${__dirname}/fixture/project-b/package.json`,
    taskId: "project-b",
    taskIndex: 0,
  })

  await store.set("spawn.project-a", spawn)
  await store.set("spawn.project-b", spawn)

  const cancelEvent = ({ event }) =>
    (event.signal.cancel = true)

  events.onAny({
    "before.fs.writeJson": cancelEvent,
    "before.spawn": cancelEvent,
  })
})

async function run(argv = {}) {
  await store.set("argv", {
    _: ["version"],
    ...argv,
  })

  events.setOp("cyclops")

  await Promise.all([
    events.cyclops("startTask", { taskId: "project-a" }),
    events.cyclops("startTask", { taskId: "project-b" }),
  ])
}

describe("match", () => {
  test("upgrades shared package to highest version", async () => {
    const args = []

    events.on(
      "before.fs.writeJson.{taskId}",
      ({ event }) => {
        args.push(event.args[0].json)
      }
    )

    await run()

    expect(args).toContainEqual({
      dependencies: { shared: "0.0.2" },
      name: "project-a",
      version: "0.0.1",
    })

    expect(args).toContainEqual({
      dependencies: {
        "project-a": "0.0.1",
        shared: "0.0.2",
      },
      name: "project-b",
      version: "0.0.1",
    })
  })

  test("spawns npm install", async () => {
    const spawns = []

    events.onAny("before.spawn", ({ event }) => {
      spawns.push(event.args)
    })

    await run()

    expect(spawns).toContainEqual([
      {
        args: ["install"],
        command: "npm",
        options: { cwd: `${__dirname}/fixture/project-b` },
      },
    ])
  })
})

describe("publish", () => {
  test("bumps versions", async () => {
    const args = []

    events.on("before.fs.writeJson.{taskId}", ({ event }) =>
      args.push(event.args[0].json)
    )

    await run({ publish: true })

    expect(args).toContainEqual({
      dependencies: { shared: "0.0.2" },
      name: "project-a",
      version: "0.0.2",
    })

    expect(args).toContainEqual({
      dependencies: {
        "project-a": "0.0.2",
        shared: "0.0.2",
      },
      name: "project-b",
      version: "0.0.2",
    })
  })
})
