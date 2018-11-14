import cyclops from "cyclops"
import dotEvent from "dot-event"
import dotStore from "dot-store"
import version from "../dist/version"

let events, store

function cancelEvent({ event }) {
  event.signal.cancel = true
}

beforeEach(async () => {
  events = dotEvent()
  store = dotStore(events)

  cyclops({ events, store })

  const spawn = {
    gitBehind: { out: "" },
    gitDirty: { code: 0 },
  }

  await store.set("spawn.project-a", spawn)
  await store.set("spawn.project-b", spawn)

  events.onAny({
    "before.fs.writeJson": cancelEvent,
    "before.spawn": cancelEvent,
  })
})

async function run(...argv) {
  await events.cyclops({
    argv,
    composer: version,
    path: `${__dirname}/fixture`,
    task: "version-tasks",
  })
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
      cyclops: { "version-tasks": {} },
      dependencies: { shared: "0.0.2" },
      name: "project-a",
      version: "0.0.1",
    })

    expect(args).toContainEqual({
      cyclops: { "version-tasks": {} },
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

    await run("--publish")

    expect(args).toContainEqual({
      cyclops: { "version-tasks": {} },
      dependencies: { shared: "0.0.2" },
      name: "project-a",
      version: "0.0.2",
    })

    expect(args).toContainEqual({
      cyclops: { "version-tasks": {} },
      dependencies: {
        "project-a": "0.0.2",
        shared: "0.0.2",
      },
      name: "project-b",
      version: "0.0.2",
    })
  })
})
