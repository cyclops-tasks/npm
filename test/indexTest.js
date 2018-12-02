// Packages
import dotEvent from "dot-event"
import dotTask from "@dot-event/task"

// Helpers
import dotVersion from "../"

// Variables
let events

// Tests
beforeEach(async () => {
  events = dotEvent()

  dotTask({ events })
  dotVersion({ events })

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
})

describe("publish", () => {
  test("bumps versions", async () => {
    const args = []

    const results = {
      behind: false,
      dirty: false,
      needsPublish: true,
    }

    events.set(
      ["tasks", "project-a", "gitStatus", "results"],
      results
    )

    events.set(
      ["tasks", "project-b", "gitStatus", "results"],
      results
    )

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
