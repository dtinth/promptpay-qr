import React from 'react'
import qr from 'qrcode'

class QRCode extends React.Component {
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
        const src = 'data:image/svg+xml,' + encodeURIComponent(svg)
        this.setState({ src })
      }
    })
  }
  render () {
    return (
      <div className='qrcode'>
        <img src={this.state.src} alt='QR Code' />
      </div>
    )
  }
}

export default QRCode
