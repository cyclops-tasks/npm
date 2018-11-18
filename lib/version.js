// Packages
import dotFs from "dot-fs-extra"
import dotGit from "dot-spawn-git"
import dotLogger from "dot-logger"
import dotSpawn from "dot-spawn"

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
  dotLogger({ events, store })
  dotSpawn({ events, store })

  events.onAny({
    version: [
      { component, dryMode, readPackageJson },
      phase(store, "Read package json"),
      {
        if: [
          () => !store.get("arg.opts.publish"),
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
          () => store.get("arg.opts.publish"),
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
      events.arg("arg", {
        alias: { d: ["dry"], p: ["publish"] },
      }),
  })

  return options
}
