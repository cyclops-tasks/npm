export function spaceStr(id, str = "") {
  const space = this.events.get(`space.${id}`)
  const newSpace = str.length + 2

  let finalSpace = space

  if (!space || newSpace > space) {
    this.events.set(`space.${id}`, newSpace)
    finalSpace = newSpace
  }

  const spaces = " ".repeat(
    finalSpace - str.length - (str ? 0 : 1)
  )

  return str + spaces
}
