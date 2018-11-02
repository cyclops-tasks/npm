export async function addArgvAliases({ store }) {
  await store.set("argvOptions.alias", {
    d: ["dry"],
    l: ["link"],
    m: ["match"],
    p: ["publish"],
  })
}

export function matchSelected({ store }) {
  const argv = store.get("argv")
  return argv.all || argv.match
}

export function publishSelected({ store }) {
  const argv = store.get("argv")
  return argv.all || argv.publish
}
