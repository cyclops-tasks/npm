import spawnComposer from "@dot-store/spawn"

import {
  addDependencies,
  installDependencies,
  syncDependenciesForMatch,
  syncDependenciesForPublish,
} from "./dependencies"

import { addArgvAliases } from "./argv"
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
      waitForAll.bind("init"),

      addDependencies,
      waitForAll.bind("addDeps"),

      syncDependenciesForMatch,
      installDependencies,
      waitForAll.bind("syncDeps"),

      { gitBehind, gitDirty },
      bumpPublishVersions,
      syncDependenciesForPublish,
      waitForAll.bind("bump"),
    ],
  })

  return store
}
