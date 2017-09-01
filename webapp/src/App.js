import React, { Component } from 'react'

import generatePayload from 'promptpay-qr'
import qr from 'qrcode'

class QRCode extends Component {
  state = { svg: '' }
  componentDidMount () {
    this.update(this.props.payload)
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.payload !== this.props.payload) {
      this.update(nextProps.payload)
    }
  }
  update (payload) {
    this.payload = payload
    qr.toString(payload, { type: 'svg', errorCorrectionLevel: 'L' }, (err, svg) => {
      if (err) {
        window.alert('Cannot generate QR code: ' + String(err))
        return
      }
      if (this.payload === payload) {
        this.setState({ svg })
      }
    })
  }
  render () {
    return (
      <div className='qrcode' dangerouslySetInnerHTML={{ __html: this.state.svg }} />
    )
  }
}

class App extends Component {
  state = {
    id: String(window.localStorage.promptpayID || ''),
    amount: 0
  }
  onSet = () => {
    const id = window.prompt('Your PromptPay ID')
    if (id != null) {
      this.setState({ id })
      window.localStorage.promptpayID = id
    }
  }
  renderQR () {
    if (!this.state.id) {
      return (
        <div className='err'>
          <span>Tap to set PromptPay ID</span>
        </div>
      )
    } else {
      const payload = generatePayload(this.state.id, { amount: this.state.amount })
      return (
        <QRCode payload={payload} />
      )
    }
  }
  render () {
    return (
      <div className='App'>
        <div className='qr' onClick={this.onSet}>
          {this.renderQR()}
        </div>
        <form className='amount' onSubmit={e => { e.preventDefault() }}>
          <input
            className='amount'
            type='number'
            step={0.01}
            min={0}
            onChange={(e) => {
              this.setState({ amount: +e.target.value })
            }}
            autoFocus
          />
          {' THB'}
        </form>
        <div className='tip'>
          <strong>Tip: </strong>Add to home screen for easier access
          <br />
          Powered by <a href='https://github.com/dtinth/promptpay-qr' target='_blank'>promptpay-qr</a>
        </div>
      </div>
    )
  }
}

export default App
