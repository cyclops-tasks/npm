// Packages
import dotStoreFs from "@dot-store/fs"
import dotStoreLog from "@dot-store/log"
import dotStoreSpawn from "@dot-store/spawn"

// Helpers
import { component } from "./version/component"
import {
  addDependencies,
  installDependencies,
  syncDependencies,
} from "./version/dependencies"
import { dryMode } from "./version/dry"
import { readPackageJson } from "./version/init"
import { bumpPublishVersions } from "./version/publish"
import { phase } from "./version/phase"

// Composer
export default function(options) {
  const { events, store } = options

  if (events.ops.has("version")) {
    return options
  }

  dotStoreFs({ events, store })
  dotStoreLog({ events, store })
  dotStoreSpawn({ events, store })

  events.onAny({
    version: [
      { component, dryMode, readPackageJson },
      phase(store, "Read package json"),
      {
        if: [
          () => !store.get("argv.opts.publish"),
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
          () => store.get("argv.opts.publish"),
          () => [
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

    versionSetup: () =>
      events.argv("argv", {
        options: {
          alias: { d: ["dry"], p: ["publish"] },
        },
      }),
  })

  return options
}
