import { h, Component } from "ink"
import { List, ListItem } from "ink-checkbox-list"

import { spaceStr } from "../spaceStr"

export class SelectComponent extends Component {
  constructor(props, context) {
    super(props, context)
    this.space = spaceStr.bind({ store: props.store })
  }

  componentDidMount() {
    const forceRender = () => {
      this.setState({ random: Math.random() })
    }

    this.spaceOff = this.props.events.onAnyEmitted(
      "store.space",
      forceRender
    )
  }

  componentWillUnmount() {
    this.spaceOff()
  }

  onSubmit(list) {
    this.props.events.emit("selectComponent.onSubmit", list)
  }

  render() {
    return (
      <List onSubmit={this.onSubmit.bind(this)}>
        <ListItem value="symlink">
          {this.space("choice", "Symlink dependencies")}
          --link
        </ListItem>
        <ListItem value="match">
          {this.space("choice", "Match newest versions")}
          --match
        </ListItem>
        <ListItem value="publish">
          {this.space("choice", "Publish packages")}
          --publish
        </ListItem>
      </List>
    )
  }
}
