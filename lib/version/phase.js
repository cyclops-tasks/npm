export function phase(events, desc) {
  const id = camel(desc)

  if (!events.get(`phase.${id}`)) {
    events.set(`phase.${id}`, () => ({
      count: 0,
      title: desc,
    }))
  }

  return waitForAll.bind(desc)
}

async function waitForAll({ events }) {
  const id = camel(this)
  const { taskCount } = events.get("task")

  await events.set(`phase.${id}`, ({ get }) => ({
    count: (get(`phase.${id}.count`) || 0) + 1,
    title: this,
  }))

  const ok = events.get(`phase.${id}.count`) === taskCount

  if (ok) {
    await events.emit(`${id}.ready`)
  } else {
    await events.onceEmitted(`emit.${id}.ready`)
  }
}

function camel(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (ltr, idx) =>
      idx === 0 ? ltr.toLowerCase() : ltr.toUpperCase()
    )
    .replace(/\s+/g, "")
}
