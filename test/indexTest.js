import dotEvent from "dot-event"
import dotStore from "@dot-event/store"
import dotTask from "@dot-event/task"

import dotVersion from "../dist/version"

let events, store

beforeEach(async () => {
  events = dotEvent()
  store = dotStore({ events })

  dotTask({ events, store })
  dotVersion({ events, store })

  const cancel = ({ event }) => (event.signal.cancel = true)

  events.onAny({
    "before.fsWriteJson": cancel,
    "before.gitCommit": cancel,
    "before.gitStatus": cancel,
    "before.spawn": cancel,
  })
})

async function run(...argv) {
  await events.task({
    argv,
    op: "version",
    path: `${__dirname}/fixture`,
  })
}

describe("match", () => {
  test("upgrades shared package to highest version", async () => {
    const args = []

    events.onAny("before.fsWriteJson", ({ event }) => {
      args.push(event.args[0].json)
    })

    await run()

    expect(args).toContainEqual({
      dependencies: { shared: "0.0.2" },
      name: "project-a",
      operations: { version: { test: true } },
      version: "0.0.1",
    })

    expect(args).toContainEqual({
      dependencies: {
        "project-a": "0.0.1",
        shared: "0.0.2",
      },
      name: "project-b",
      operations: { version: { test: true } },
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
        cwd: `${__dirname}/fixture/project-b`,
      },
    ])
  })
})

describe("publish", () => {
  test("bumps versions", async () => {
    const args = []

    const spawn = {
      behind: { result: false },
      dirty: { result: false },
      needsPublish: { result: true },
    }

    store.set(["tasks", "project-a", "gitStatus"], spawn)
    store.set(["tasks", "project-b", "gitStatus"], spawn)

    events.onAny("before.fsWriteJson", ({ event }) => {
      args.push(event.args[0].json)
    })

    await run("--publish")

    expect(args).toContainEqual({
      dependencies: { shared: "0.0.2" },
      name: "project-a",
      operations: { version: { test: true } },
      version: "0.0.2",
    })

    expect(args).toContainEqual({
      dependencies: {
        "project-a": "0.0.2",
        shared: "0.0.2",
      },
      name: "project-b",
      operations: { version: { test: true } },
      version: "0.0.2",
    })
  })
})
