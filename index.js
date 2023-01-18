/*!
 * promptpay-qr
 * JavaScript library to generate PromptPay QR code
 * <https://github.com/dtinth/promptpay-qr>
 *
 * Refs:
 * - https://www.blognone.com/node/95133
 * - https://www.emvco.com/emv-technologies/qrcodes/
 *
 * @license MIT
 */

const crc = require('crc')

const ID_PAYLOAD_FORMAT = '00'
const ID_POI_METHOD = '01'
const ID_MERCHANT_INFORMATION_BOT = '29'
const ID_TRANSACTION_CURRENCY = '53'
const ID_TRANSACTION_AMOUNT = '54'
const ID_COUNTRY_CODE = '58'
const ID_CRC = '63'

const PAYLOAD_FORMAT_EMV_QRCPS_MERCHANT_PRESENTED_MODE = '01'
const POI_METHOD_STATIC = '11'
const POI_METHOD_DYNAMIC = '12'
const MERCHANT_INFORMATION_TEMPLATE_ID_GUID = '00'
const BOT_ID_MERCHANT_PHONE_NUMBER = '01'
const BOT_ID_MERCHANT_TAX_ID = '02'
const BOT_ID_MERCHANT_EWALLET_ID = '03'
const GUID_PROMPTPAY = 'A000000677010111'
const TRANSACTION_CURRENCY_THB = '764'
const COUNTRY_CODE_TH = 'TH'

function generatePayload (target, options) {
  target = sanitizeTarget(target)

  const amount = options.amount
  const targetType = (
    target.length >= 15
      ? (
          BOT_ID_MERCHANT_EWALLET_ID
        )
      : target.length >= 13
        ? (
            BOT_ID_MERCHANT_TAX_ID
          )
        : (
            BOT_ID_MERCHANT_PHONE_NUMBER
          )
  )

  const data = [
    f(ID_PAYLOAD_FORMAT, PAYLOAD_FORMAT_EMV_QRCPS_MERCHANT_PRESENTED_MODE),
    f(ID_POI_METHOD, amount ? POI_METHOD_DYNAMIC : POI_METHOD_STATIC),
    f(ID_MERCHANT_INFORMATION_BOT, serialize([
      f(MERCHANT_INFORMATION_TEMPLATE_ID_GUID, GUID_PROMPTPAY),
      f(targetType, formatTarget(target))
    ])),
    f(ID_COUNTRY_CODE, COUNTRY_CODE_TH),
    f(ID_TRANSACTION_CURRENCY, TRANSACTION_CURRENCY_THB),
    amount && f(ID_TRANSACTION_AMOUNT, formatAmount(amount))
  ]
  const dataToCrc = serialize(data) + ID_CRC + '04'
  data.push(f(ID_CRC, formatCrc(crc.crc16xmodem(dataToCrc, 0xffff))))
  return serialize(data)
}

function f (id, value) {
  return [id, ('00' + value.length).slice(-2), value].join('')
}

function serialize (xs) {
  return xs.filter(function (x) { return x }).join('')
}

function sanitizeTarget (id) {
  return id.replace(/[^0-9]/g, '')
}

function formatTarget (id) {
  const numbers = sanitizeTarget(id)
  if (numbers.length >= 13) return numbers
  return ('0000000000000' + numbers.replace(/^0/, '66')).slice(-13)
}

function formatAmount (amount) {
  return amount.toFixed(2)
}

function formatCrc (crcValue) {
  return ('0000' + crcValue.toString(16).toUpperCase()).slice(-4)
}

module.exports = generatePayload
