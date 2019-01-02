// Packages
import semver from "semver"

export async function addDeps(options) {
  const { events, props } = options
  const { deps, devDeps, name, version } = events.get(props)

  await addDep({ ...options, name, version })

  const dependencies = Object.keys(deps).concat(
    Object.keys(devDeps)
  )

  await Promise.all(
    dependencies.map(async dep => {
      const prod = fixDep(deps[dep])
      const dev = fixDep(devDeps[dep])
      const version = semver.gt(prod, dev) ? prod : dev

      await addDep({
        ...options,
        name: dep,
        version,
      })
    })
  )
}

export async function addDep(options) {
  const { events, name, version } = options

  if (!name || !version) {
    return
  }

  await events.set(["deps", name], () => {
    const current = fixDep(events.get(["deps", name]))

    return fixDep(
      semver.gt(current, version) ? current : version
    )
  })
}

function fixDep(dep) {
  return dep
    ? semver.coerce(dep).version + depHyphen(dep)
    : "0.0.0"
}

function depHyphen(dep) {
  return dep && dep.indexOf("-") > -1
    ? "-" + dep.split(/-/)[1]
    : ""
}
