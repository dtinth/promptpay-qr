import QRCode from './QRCode'
import React from 'react'
import { storiesOf } from '@storybook/react'

class QRCodeDemo extends React.Component {
  state = { text: this.getText() }
  getText() {
    return new Date().toString()
  }
  componentDidMount() {
    this.interval = setInterval(() => {
      this.refresh()
    }, 1000)
  }
  refresh() {
    this.setState({ text: this.getText() })
  }
  componentWillUnmount() {
    clearInterval(this.interval)
  }
  render() {
    return <QRCode payload={this.state.text} />
  }
}

storiesOf('QRCode', module).add('QR codes', () => <QRCodeDemo />)
