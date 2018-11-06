import dotStoreFs from "@dot-store/fs"
import dotStoreLog from "@dot-store/log"
import dotStoreSpawn from "@dot-store/spawn"

import {
  addDependencies,
  installDependencies,
  syncDependencies,
} from "./dependencies"

import { component } from "./component"
import { dryMode } from "./dry"
import { gitBehind, gitDirty } from "./git"
import { readPackageJson } from "./init"
import { bumpPublishVersions } from "./publish"
import { phase } from "./phase"

export default function(options) {
  const { events, store } = options

  dotStoreFs({ events, store })
  dotStoreLog({ events, store })
  dotStoreSpawn({ events, store })

  events.on({
    "emit.beforeRunTasks": async () =>
      await store.set("argvOptions.alias", {
        d: ["dry"],
        p: ["publish"],
      }),

    "emit.startTask": [
      { component, dryMode, readPackageJson },
      phase(store, "Read package json"),
      {
        if: [
          () => !store.get("argv.publish"),
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
          () => store.get("argv.publish"),
          () => [
            { gitBehind, gitDirty },
            bumpPublishVersions,
            phase(store, "Bump publish versions"),

            addDependencies,
            phase(store, "Find highest versions"),

            syncDependencies,
            phase(store, "Match versions and publish"),
          ],
        ],
      },
      () => events.emit("unmount"),
    ],
  })

  return options
}
