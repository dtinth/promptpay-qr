import Flipper from './Flipper'
import React from 'react'
import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'

const Side = props => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        background: props.background,
      }}
    >
      {props.children}
    </div>
  )
}

const front = <Side background="#456789">FRONT</Side>
const back = <Side background="#987654">BACK</Side>

class FlipperContainer extends React.Component {
  state = { flipped: false }
  render() {
    return (
      <div>
        <p>
          <input
            type="checkbox"
            checked={this.state.flipped}
            onChange={({ target: { checked: flipped } }) =>
              this.setState({ flipped })
            }
          />
          {' Flipped'}
        </p>
        <Flipper
          front={front}
          back={back}
          flipped={this.state.flipped}
          onFlip={flipped => {
            this.setState({ flipped })
            this.props.onFlip(flipped)
          }}
        />
      </div>
    )
  }
}

storiesOf('Flipper', module).add('flipper', () => (
  <FlipperContainer onFlip={action('onFlip')} />
))
