// Packages
import dotFs from "@dot-event/fs"
import dotGit from "@dot-event/git"
import dotLog from "@dot-event/log"
import dotSpawn from "@dot-event/spawn"

// Helpers
import { component } from "./version/component"
import { addDeps, syncDeps } from "./version/deps"
import { dryMode } from "./version/dry"
import { commit } from "./version/git"
import { readPackageJson } from "./version/init"
import { install, publish } from "./version/npm"
import { bumpPublishVersions } from "./version/publish"
import { phase } from "./version/phase"

// Composer
export default function(options) {
  const { events, store } = options

  if (events.ops.has("version")) {
    return options
  }

  dotFs({ events, store })
  dotGit({ events, store })
  dotLog({ events, store })
  dotSpawn({ events, store })

  events.onAny({
    version: [
      { component, dryMode, readPackageJson },
      phase(store, "Read package json"),
      {
        if: [
          () => !store.get("argv.opts.publish"),
          () => [
            addDeps,
            phase(store, "Find highest versions"),

            syncDeps,
            phase(store, "Match versions"),

            install,
            phase(store, "Install"),
          ],
        ],
      },
      {
        if: [
          () => store.get("argv.opts.publish"),
          () => [
            bumpPublishVersions,
            phase(store, "Bump publish versions"),

            addDeps,
            phase(store, "Find highest versions"),

            syncDeps,
            phase(store, "Match versions"),

            publish,
            phase(store, "Publish"),

            commit,
            phase(store, "Commit and push"),
          ],
        ],
      },
      () => events.emit("unmount"),
    ],

    versionSetup: () =>
      events.argv("argv", {
        alias: {
          d: ["dry"],
          f: ["force"],
          p: ["publish"],
        },
      }),
  })

  return options
}
