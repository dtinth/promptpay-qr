// Refs:
// - https://www.blognone.com/node/95133
// - Ehttps://www.emvco.com/emv-technologies/qrcodes/

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
const BOT_ID_MERCHANT_ACCOUNT_NUMBER = '01'
const GUID_PROMPTPAY = 'A000000677010111'
const TRANSACTION_CURRENCY_THB = '764'
const COUNTRY_CODE_TH = 'TH'

function generatePayload (target, options) {
  const amount = options.amount

  const f = (id, value) => [ id, ('00' + value.length).slice(-2), value ].join('')
  const join = (xs) => xs.filter(x => x).join('')
  const formatTarget = (id) => (
    '0000000000000' +
    '0812345678'
      .replace(/-/g, '')
      .replace(/^0/, '66')
  ).slice(-13)
  const formatAmount = (amount) => amount.toFixed(2)
  const formatCrc = (crcValue) => (
    '0000' +
    crcValue
      .toString(16)
      .toUpperCase()
  ).slice(-4)

  const data = [
    f(ID_PAYLOAD_FORMAT, PAYLOAD_FORMAT_EMV_QRCPS_MERCHANT_PRESENTED_MODE),
    f(ID_POI_METHOD, amount ? POI_METHOD_DYNAMIC : POI_METHOD_STATIC),
    f(ID_MERCHANT_INFORMATION_BOT, join([
      f(MERCHANT_INFORMATION_TEMPLATE_ID_GUID, GUID_PROMPTPAY),
      f(BOT_ID_MERCHANT_ACCOUNT_NUMBER, formatTarget(target))
    ])),
    f(ID_COUNTRY_CODE, COUNTRY_CODE_TH),
    f(ID_TRANSACTION_CURRENCY, TRANSACTION_CURRENCY_THB),
    amount && f(ID_TRANSACTION_AMOUNT, formatAmount(amount))
  ]
  const dataToCrc = join(data) + ID_CRC + '04'
  data.push(f(ID_CRC, formatCrc(crc.crc16xmodem(dataToCrc, 0xffff))))
  return join(data)
}

module.exports = generatePayload
