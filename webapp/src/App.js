import React, { Component } from 'react'

import Flipper from './Flipper'
import generatePayload from 'promptpay-qr'
import qr from 'qrcode'

const ver = require('promptpay-qr/package.json').version

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
    amount: 0,
    flipped: false
  }
  onSet = () => {
    const id = window.prompt('Your PromptPay ID (phone number or e-Wallet ID)', this.state.id)
    if (id != null) {
      this.setState({ id })
      window.localStorage.promptpayID = id
    }
  }
  onFlip = (flipped) => {
    this.setState({ flipped })
  }
  renderQR () {
    if (!this.state.id) {
      return (
        <button className='err' onClick={this.onSet}>
          {t('กดที่นี่เพื่อตั้งค่ารหัสพร้อมเพย์', 'Tap to set PromptPay ID')}
        </button>
      )
    } else {
      const payload = generatePayload(this.state.id, { amount: this.state.amount })
      return (
        <div className='qrcode-container' onClick={this.onSet}>
          <QRCode payload={payload} />
        </div>
      )
    }
  }
  renderExplanation () {
    if (!this.state.id) {
      return (
        <span>{t('กดที่กล่องข้างบน เพื่อใส่รหัสพร้อมเพย์ที่ใช้รับเงิน', 'Tap above to get started')}</span>
      )
    } else {
      const id = this.state.id.replace(/[^0-9]/g, '')
      return (
        <span>
          {id.length >= 15 ? (
            t('QR code มีรหัส e-Wallet ของคุณ', 'QR code contains your e-Wallet')
          ) : id.length >= 13 ? (
            t('QR code มีเลขประจำตัวของคุณ', 'QR code contains your ID')
          ) : (
            t('QR code มีเบอร์โทรศัพท์ของคุณ', 'QR code contains your phone number')
          )}
          : <strong onClick={this.onSet} style={{ color: '#bef', cursor: 'pointer' }}>{id}</strong>
        </span>
      )
    }
  }
  renderSlotSelector () {
    return (
      <div onClick={() => this.setState({ flipped: false })}>
        SLOT 1<br />
        SLOT 2<br />
        SLOT 3
      </div>
    )
  }
  render () {
    return (
      <div className='App'>
        <Flipper
          front={this.renderQR()}
          back={this.renderSlotSelector()}
          flipped={this.state.flipped}
          onFlip={this.onFlip}
        />
        <div className='qr-explanation'>
          {this.renderExplanation()}
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
          {' '}
          {t('บาท', 'THB')}
        </form>
        <div className='tip'>
          <strong>Tip: </strong>Add to home screen for easier access
          <br />
          Powered by <a href='https://github.com/dtinth/promptpay-qr' target='_blank'>promptpay-qr</a>@{ver}
        </div>
      </div>
    )
  }
}

function t (th, en) {
  if (window.location.hostname === 'promptpay2.me' || window.location.hostname === 'dev.promptpay2.me') {
    return <span title={en}>{th}</span>
  }
  return <span title={th}>{en}</span>
}

export default App
