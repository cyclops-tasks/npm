export async function resetArgv({ argv, events, store }) {
  await store.merge("cyclops.argvOptions.alias", {
    d: ["dry"],
    p: ["publish"],
  })

  await events.argv("cyclops", {
    argv,
    options: store.get("cyclops.argvOptions"),
  })
}
