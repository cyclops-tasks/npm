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

  events.onAny({
    "before.gitStatus": async ({ props }) => {
      await events.set([...props, "gitStatus", "results"], {
        behind: false,
        dirty: false,
        needsPublish: true,
      })
    },
  })
})

async function run(...argv) {
  await events.task({
    argv,
    op: "version",
    path: `${__dirname}/fixture`,
  })
}

test("bumps versions", async () => {
  const args = []

  events.onAny("before.fsWriteJson", ({ event }) => {
    args.push(event.args[0].json)
  })

  await run()

  expect(args).toContainEqual({
    dependencies: { shared: "0.0.2" },
    devDependencies: {},
    name: "project-a",
    operations: { version: { test: true } },
    version: "0.0.2",
  })

  expect(args).toContainEqual({
    dependencies: {
      "project-a": "0.0.2",
      shared: "0.0.2",
    },
    devDependencies: {},
    name: "project-b",
    operations: { version: { test: true } },
    version: "0.0.2",
  })
})
