import spawnComposer from "@dot-store/spawn"

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

import { gitBehind, gitDirty } from "./git"
import { readPackageJson } from "./init"
import { bumpPublishVersions } from "./publish"
import { addSelectComponent } from "./selectComponent"
import { waitForAll } from "./wait"

export default function(store) {
  spawnComposer(store)

  store.on({
    beforeAllTasks: addArgvAliases,

    startTask: [
      { addSelectComponent, readPackageJson },
      waitForAll("init"),
      {
        if: matchSelected,
        match: [
          addDependencies,
          waitForAll("addDeps"),

          syncDependencies,
          installDependencies,
          waitForAll("syncDeps"),
        ],
      },
      {
        if: publishSelected,
        publish: [
          { gitBehind, gitDirty },
          bumpPublishVersions,
          syncDependencies,
          waitForAll("bump"),
        ],
      },
    ],
  })

  return store
}
