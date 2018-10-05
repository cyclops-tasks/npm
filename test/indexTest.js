import storeComposer from "dot-store"
import npmTaskComposer from "../dist/npm"

let store

beforeEach(async () => {
  store = npmTaskComposer(storeComposer())

  await store.set("argv", { _: ["npm-tasks"], all: true })

  const baseOptions = {
    gitBehind: { out: "" },
    gitDirty: { code: 0 },
    taskCount: 2,
    taskIndex: 0,
  }

  await store.set("tasks.project-a", {
    projectPath: `${__dirname}/fixture/project-a`,
    projectPkgPath: `${__dirname}/fixture/project-a/package.json`,
    taskId: "project-a",
    taskLeader: true,
    ...baseOptions,
  })

  await store.set("tasks.project-b", {
    projectPath: `${__dirname}/fixture/project-b`,
    projectPkgPath: `${__dirname}/fixture/project-b/package.json`,
    taskId: "project-b",
    ...baseOptions,
  })

  store
    .before()
    .withOp("spawn")
    .onAny(({ event }) => {
      event.signal.cancel = true
    })
})

async function run(option = "all") {
  await store.set("argv", {
    _: ["npm-tasks"],
    [option]: true,
  })

  await Promise.all([
    store
      .withOptions({ taskId: "project-a" })
      .emit("startTask"),
    store
      .withOptions({ taskId: "project-b" })
      .emit("startTask"),
  ])
}

describe("all", () => {
  test("waits for all steps", async () => {
    await run()

    expect(store.state.wait).toEqual({
      addDeps: 2,
      bump: 2,
      init: 2,
      syncDeps: 2,
    })
  })
})

describe("match", () => {
  test("upgrades shared package to highest version", async () => {
    const args = []

    store.on("writeJson", ({ event }) =>
      args.push(event.args[1])
    )

    await run("match")

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

    store
      .before()
      .withOp("spawn")
      .onAny(({ event }) => {
        spawns.push(event.args)
      })

    await run("match")

    expect(spawns).toContainEqual([
      "npm",
      "install",
      { cwd: `${__dirname}/fixture/project-a` },
    ])

    expect(spawns).toContainEqual([
      "npm",
      "install",
      { cwd: `${__dirname}/fixture/project-b` },
    ])
  })
})

describe("publish", () => {
  test("bumps versions", async () => {
    const args = []

    store.on("writeJson", ({ event }) =>
      args.push(event.args[1])
    )

    await run("publish")

    expect(args).toContainEqual({
      dependencies: { shared: "0.0.2" },
      name: "project-a",
      version: "0.0.2",
    })

    expect(args).toContainEqual({
      dependencies: {
        "project-a": "0.0.2",
        shared: "0.0.1",
      },
      name: "project-b",
      version: "0.0.2",
    })
  })
})
