import cyclops from "cyclops"
import dotEvent from "dot-event"
import dotStore from "dot-store"

import version from "../dist/version"

let events, store

beforeEach(async () => {
  events = dotEvent()
  store = dotStore(events)

  cyclops({ events, store })

  events.onAny({
    "before.fs": ({ event, writeJson }) => {
      if (writeJson) {
        event.signal.cancel = true
      }
    },
    "before.git": ({ event }) => {
      event.signal.cancel = true
    },
    "before.spawn": ({ event }) => {
      event.signal.cancel = true
    },
  })
})

async function run(...argv) {
  await events.cyclops({
    argv,
    composer: version,
    op: "version",
    path: `${__dirname}/fixture`,
  })
}

describe("match", () => {
  test("upgrades shared package to highest version", async () => {
    const args = []

    events.onAny("before.fs", ({ event, writeJson }) => {
      if (writeJson) {
        args.push(event.args[0].json)
      }
    })

    await run()

    expect(args).toContainEqual({
      cyclops: { version: { test: true } },
      dependencies: { shared: "0.0.2" },
      name: "project-a",
      version: "0.0.1",
    })

    expect(args).toContainEqual({
      cyclops: { version: { test: true } },
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

    const spawn = {
      behind: { result: false },
      dirty: { result: false },
      needsPublish: { result: true },
    }

    store.set(["tasks", "project-a", "gitStatus"], spawn)
    store.set(["tasks", "project-b", "gitStatus"], spawn)

    events.onAny("before.fs", ({ event, writeJson }) => {
      if (writeJson) {
        args.push(event.args[0].json)
      }
    })

    await run("--publish")

    expect(args).toContainEqual({
      cyclops: { version: { test: true } },
      dependencies: { shared: "0.0.2" },
      name: "project-a",
      version: "0.0.2",
    })

    expect(args).toContainEqual({
      cyclops: { version: { test: true } },
      dependencies: {
        "project-a": "0.0.2",
        shared: "0.0.2",
      },
      name: "project-b",
      version: "0.0.2",
    })
  })
})
