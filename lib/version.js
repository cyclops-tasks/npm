// Packages
import dotFs from "@dot-event/fs"
import dotGit from "@dot-event/git"
import dotLog from "@dot-event/log"
import dotSpawn from "@dot-event/spawn"
import dotStore from "@dot-event/store"

// Helpers
import { component } from "./version/component"
import { addDeps, syncDeps } from "./version/deps"
import { commit } from "./version/git"
import { readPackageJson } from "./version/init"
import { install, publish } from "./version/npm"
import { bumpPublishVersions } from "./version/publish"
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
        { component, readPackageJson },
        phase(events, "Read package json"),
        {
          if: [
            () => !events.get("argv.opts.publish"),
            () => [
              addDeps,
              phase(events, "Find highest versions"),

              syncDeps,
              phase(events, "Match versions"),

              install,
              phase(events, "Install"),
            ],
          ],
        },
        {
          if: [
            () => events.get("argv.opts.publish"),
            () => [
              bumpPublishVersions,
              phase(events, "Bump publish versions"),

              addDeps,
              phase(events, "Find highest versions"),

              syncDeps,
              phase(events, "Match versions"),

              publish,
              phase(events, "Publish"),

              commit,
              phase(events, "Commit and push"),
            ],
          ],
        },
        () => events.emit("unmount"),
      ],

      versionSetup: () =>
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
