// Packages
import dotFs from "@dot-event/fs"
import dotGit from "@dot-event/git"
import dotLog from "@dot-event/log"
import dotSpawn from "@dot-event/spawn"
import dotStore from "@dot-event/store"
import { readJson } from "fs-extra"
import semver from "semver"

// Helpers
import { component } from "./version/component"
import { addDep, addDeps } from "./version/deps"
import { status } from "./version/git"
import { readPackageJson } from "./version/init"
import { phase } from "./version/phase"

// Composer
export default function(options) {
  const { events } = options

  if (events.ops.has("version")) {
    return options
  }

  dotFs({ events })
  dotGit({ events })
  dotLog({ events })
  dotSpawn({ events })
  dotStore({ events })

  events
    .withOptions({
      cwd: process.cwd(),
    })
    .onAny({
      version: [
        component,
        readPackageJson,
        phase(events, "Read package json"),
        addDeps,
        phase(events, "Consolidate dependencies"),
        status,
        phase(events, "Git status"),
        bumpVersions,
        phase(events, "Bump versions"),
        matchVersions,
        phase(events, "Match versions"),
        writePackageJson,
        phase(events, "Write package"),
        commit,
        phase(events, "Commit"),
        () => events.emit("unmount"),
      ],

      versionSetupOnce: () =>
        events.argv({
          alias: {
            d: ["dry"],
            f: ["force"],
            p: ["publish"],
          },
        }),
    })

  return options
}

async function bumpVersions(options) {
  const { events, props } = options

  const { behind, dirty, needsPublish } = events.get([
    ...props,
    "gitStatus",
    "results",
  ])

  if (behind || dirty) {
    await events.set([...props, "ignore"], true)
  }

  if (needsPublish) {
    await bumpVersion(options)
  }
}

async function matchVersions(options) {
  const { events, props } = options
  const { deps, devDeps, ignore } = events.get(props)

  if (ignore) {
    return
  }

  for (const dep in deps) {
    const newDep = events.get(["deps", dep])
    if (deps[dep] !== newDep) {
      await events.set([...props, "deps", dep], newDep)
      await events.set([...props, "matched"], true)
      await bumpVersion(options)
    }
  }

  for (const dep in devDeps) {
    const newDep = events.get(["deps", dep])
    if (devDeps[dep] !== newDep) {
      await events.set([...props, "devDeps", dep], newDep)
      await events.set([...props, "matched"], true)
      await bumpVersion(options)
    }
  }
}

async function writePackageJson(options) {
  const { events, props } = options

  const {
    deps,
    devDeps,
    ignore,
    projectPkgPath,
    version,
  } = events.get(props)

  if (ignore) {
    return
  }

  const json = await readJson(projectPkgPath)

  json.version = version
  json.dependencies = deps
  json.devDependencies = devDeps

  await events.fsWriteJson([...props, "syncDeps"], {
    json,
    path: projectPkgPath,
    spaces: 2,
  })
}

async function commit(options) {
  const { event, events, props } = options
  const { bumped, ignore, matched } = events.get(props)

  if (ignore) {
    return
  }

  if (bumped || matched) {
    await events.gitCommit(props, {
      ...event.options,
      message: "Version bump",
    })
  }
}

async function bumpVersion(options) {
  const { events, props, publish } = options

  const { bumped, ignore, name, version } = events.get(
    props
  )

  if (bumped || ignore) {
    return
  }

  const newVersion = semver.inc(version, publish || "patch")

  await Promise.all([
    events.set([...props, "bumped"], true),
    events.set([...props, "version"], newVersion),
    addDep({
      ...options,
      name,
      version: newVersion,
    }),
  ])
}
