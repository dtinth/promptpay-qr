#!/usr/bin/env node
const qr = require('qrcode')
const argv = require('minimist')(process.argv.slice(2), { string: '_' })
const generatePayload = require('./')
const target = String(argv._[0]).replace(/-/g, '')

if (!/^(0|66)\d{9}|\d{13}$/.test(target)) {
  console.error('Invalid recipient given: expected tax id or phone number')
  process.exit(1)
}

const payload = generatePayload(target, { amount: +argv.amount || +argv._[1] })
console.log(payload)

qr.toString(payload, { type: 'terminal', errorCorrectionLevel: 'L' }, (e, s) => {
  if (e) throw e
  console.log(s)
})
