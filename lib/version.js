import dotFs from "@dot-store/fs"
import dotLog from "@dot-store/log"
import dotSpawn from "@dot-store/spawn"

import {
  addDependencies,
  installDependencies,
  syncDependencies,
} from "./dependencies"

import {
  addArgvAliases,
  matchSelected,
  publishSelected,
} from "./argv"

import { component } from "./component"
import { dryMode } from "./dry"
import { gitBehind, gitDirty } from "./git"
import { readPackageJson } from "./init"
import { bumpPublishVersions } from "./publish"
import { phase } from "./phase"

export default function(options) {
  const { events, store } = options

  dotFs({ events, store })
  dotLog({ events, store })
  dotSpawn({ events, store })

  events.onAny("before", async ({ event }) => {
    if (event.op !== "log") {
      await events.log("any", { event })
    }
  })

  events.on({
    "emit.beforeRunTasks": addArgvAliases,

    "emit.startTask": [
      { component, dryMode, readPackageJson },
      phase(store, "Read package json"),
      {
        if: [
          matchSelected,
          () => [
            addDependencies,
            phase(store, "Find highest versions"),

            syncDependencies,
            installDependencies,
            phase(store, "Match versions and install"),
          ],
        ],
      },
      {
        if: [
          publishSelected,
          () => [
            { gitBehind, gitDirty },
            bumpPublishVersions,
            phase(store, "Bump publish versions"),

            syncDependencies,
            phase(store, "Match versions and publish"),
          ],
        ],
      },
      ({ taskId }) => {
        if (store.get(`tasks.${taskId}.taskLeader`)) {
          events.emit("unmount")
        }
      },
    ],
  })

  return options
}
