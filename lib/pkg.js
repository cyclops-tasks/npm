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

  dotSpawn({ events, store })

  events.on({
    "emit.beforeAllTasks": addArgvAliases,

    "emit.startTask": [
      { component, dryMode, readPackageJson },
      phase("Read package json"),
      {
        if: matchSelected,
        then: [
          addDependencies,
          phase("Find highest versions"),

          syncDependencies,
          installDependencies,
          phase("Match versions and install"),
        ],
      },
      {
        if: publishSelected,
        then: [
          { gitBehind, gitDirty },
          bumpPublishVersions,
          phase("Bump publish versions"),

          syncDependencies,
          phase("Match versions and publish"),
        ],
      },
      () => events.emit("unmount"),
    ],
  })

  return options
}
