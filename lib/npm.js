export default async function({ store }) {
  store.emit("Component", { component })
}

export function component({ h, Component, Spinner }) {
  class Npm extends Component {
    render() {
      return <Spinner green />
    }
  }

  return <Npm />
}
