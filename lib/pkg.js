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

import { component } from "./component"
import { gitBehind, gitDirty } from "./git"
import { readPackageJson } from "./init"
import { bumpPublishVersions } from "./publish"
import { waitForAll } from "./wait"

export default function(store) {
  spawnComposer(store)

  store.on({
    beforeAllTasks: addArgvAliases,

    startTask: [
      { component, readPackageJson },
      waitForAll("Read package json"),
      {
        if: matchSelected,
        then: [
          addDependencies,
          waitForAll("Find highest versions"),

          syncDependencies,
          installDependencies,
          waitForAll("Match versions and install"),
        ],
      },
      {
        if: publishSelected,
        then: [
          { gitBehind, gitDirty },
          bumpPublishVersions,
          waitForAll("Bump publish versions"),

          syncDependencies,
          waitForAll("Match versions and publish"),
        ],
      },
      () => store.emit("unmount"),
    ],
  })

  return store
}
