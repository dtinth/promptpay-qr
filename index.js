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

var crc = require('crc')

var ID_PAYLOAD_FORMAT = '00'
var ID_POI_METHOD = '01'
var ID_MERCHANT_INFORMATION_BOT = '29'
var ID_TRANSACTION_CURRENCY = '53'
var ID_TRANSACTION_AMOUNT = '54'
var ID_COUNTRY_CODE = '58'
var ID_CRC = '63'

var PAYLOAD_FORMAT_EMV_QRCPS_MERCHANT_PRESENTED_MODE = '01'
var POI_METHOD_STATIC = '11'
var POI_METHOD_DYNAMIC = '12'
var MERCHANT_INFORMATION_TEMPLATE_ID_GUID = '00'
var BOT_ID_MERCHANT_PHONE_NUMBER = '01'
var BOT_ID_MERCHANT_TAX_ID = '02'
var BOT_ID_MERCHANT_EWALLET_ID = '03'
var GUID_PROMPTPAY = 'A000000677010111'
var TRANSACTION_CURRENCY_THB = '764'
var COUNTRY_CODE_TH = 'TH'

function generatePayload (target, options) {
  target = sanitizeTarget(target)

  var amount = options.amount
  var targetType = (
    target.length >= 15 ? (
      BOT_ID_MERCHANT_EWALLET_ID
    ) : target.length >= 13 ? (
      BOT_ID_MERCHANT_TAX_ID
    ) : (
      BOT_ID_MERCHANT_PHONE_NUMBER
    )
  )

  var data = [
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
  var dataToCrc = serialize(data) + ID_CRC + '04'
  data.push(f(ID_CRC, formatCrc(crc.crc16xmodem(dataToCrc, 0xffff))))
  return serialize(data)
}

function f (id, value) {
  return [ id, ('00' + value.length).slice(-2), value ].join('')
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
