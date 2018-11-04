export async function addArgvAliases({ store }) {
  await store.set("argvOptions.alias", {
    d: ["dry"],
    p: ["publish"],
  })
}

export function matchSelected({ store }) {
  const argv = store.get("argv")
  return !argv.publish
}

export function publishSelected({ store }) {
  const argv = store.get("argv")
  return argv.publish
}
