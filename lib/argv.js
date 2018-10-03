export async function addArgvAliases({ store }) {
  await store.set("argvOptions.alias", {
    l: ["link"],
    m: ["match"],
    p: ["publish"],
  })
}
