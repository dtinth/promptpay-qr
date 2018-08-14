import React from 'react'
import qr from 'qrcode'
import createPixelsRenderer from './createPixelsRenderer'

class QRCode extends React.Component {
  state = { svg: '' }
  componentDidMount () {
    this.renderer = createPixelsRenderer(this.div)
    this.update(this.props.payload)
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.payload !== this.props.payload) {
      this.update(nextProps.payload)
    }
  }
  componentWillUnmount () {
    this.renderer.dispose()
  }
  update (payload) {
    this.payload = payload
    qr.toString(payload, { type: 'svg', errorCorrectionLevel: 'L' }, (err, svg) => {
      if (err) {
        window.alert('Cannot generate QR code: ' + String(err))
        return
      }
      if (this.payload === payload) {
        const sizeMatch = /width="(\d+)" height="(\d+)"/.exec(svg)
        if (!sizeMatch) {
          window.alert('Failed to parse SVG...')
          return
        }
        const width = sizeMatch[1] / 4
        const height = sizeMatch[2] / 4
        const regexp = /x="(\d+)" y="(\d+)"/g
        const pixels = [ ]
        for (;;) {
          const m = regexp.exec(svg)
          if (!m) break
          const [ , x, y ] = m
          if (!+x && !+y) continue
          pixels.push({ x: x / 4, y: y / 4 })
        }
        this.renderer.update(width, height, pixels)
      }
    })
  }
  render () {
    return (
      <div className='qrcode' ref={div => { this.div = div }} />
    )
  }
}

export default QRCode
