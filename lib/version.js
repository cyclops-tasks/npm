// Packages
import dotFs from "@dot-event/fs"
import dotGit from "@dot-event/git"
import dotLog from "@dot-event/log"
import dotSpawn from "@dot-event/spawn"
import dotStore from "@dot-event/store"

// Helpers
import { component } from "./version/component"
import { bumpAndMatchDeps, matchDeps } from "./version/deps"
import { commit } from "./version/git"
import { readPackageJson } from "./version/init"
import { publish } from "./version/npm"
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
              matchDeps,
              phase(events, "Match versions"),

              commit,
              phase(events, "Commit"),
            ],
          ],
        },
        {
          if: [
            ({ props }) =>
              events.get("argv.opts.publish") &&
              events.get([
                ...props,
                "operation",
                "publish",
              ]) !== false,
            () => [
              bumpAndMatchDeps,
              phase(events, "Bump and match versions"),

              publish,
              phase(events, "Publish"),
            ],
          ],
        },
        () => events.emit("unmount"),
      ],

      versionSetupOnce: () =>
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
