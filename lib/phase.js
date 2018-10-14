export function phase(id) {
  return waitForAll.bind(id)
}

async function waitForAll({ events, store }) {
  const id = camel(this)
  const taskCount = store.get("taskCount")

  await store.set(`phase.${id}`, ({ get }) => ({
    count: (get(`phase.${id}.count`) || 0) + 1,
    title: this,
  }))

  const ok = store.get(`phase.${id}.count`) === taskCount

  if (ok) {
    await events.emit(`${id}.ready`)
  } else {
    await events.onceEmitted(`emit.${id}.ready`)
  }
}

function camel(str) {
  return str
    .replace(
      /(?:^\w|[A-Z]|\b\w)/g,
      (ltr, idx) =>
        idx === 0 ? ltr.toLowerCase() : ltr.toUpperCase()
    )
    .replace(/\s+/g, "")
}
