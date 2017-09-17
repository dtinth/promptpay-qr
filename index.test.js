const generatePayload = require('./')

/* eslint-env jest */
function testcase (name, id, options, expected) {
  test(`${name}: ${id} ${require('util').inspect(options)} => ${expected}`, () => {
    expect(generatePayload(id, options)).toBe(expected)
  })
}

describe('Phone number', () => {
  testcase(
    'Local phone number',
    '0801234567',
    { },
    '00020101021129370016A000000677010111011300668012345675802TH530376463046197'
  )

  testcase(
    'Dashed local phone number',
    '080-123-4567',
    { },
    '00020101021129370016A000000677010111011300668012345675802TH530376463046197'
  )

  testcase(
    'Dashed phone number',
    '+66-89-123-4567',
    { },
    '00020101021129370016A000000677010111011300668912345675802TH5303764630429C1'
  )
})

describe('National ID number', () => {
  testcase(
    'National ID number',
    '1111111111111',
    { },
    '00020101021129370016A000000677010111021311111111111115802TH530376463047B5A'
  )
  testcase(
    'Dashed national ID number',
    '1-1111-11111-11-1',
    { },
    '00020101021129370016A000000677010111021311111111111115802TH530376463047B5A'
  )
})

describe('Tax ID', () => {
  testcase(
    'Tax ID number',
    '0123456789012',
    { },
    '00020101021129370016A000000677010111021301234567890125802TH530376463040CBD'
  )
})

describe('eWallet ID', () => {
  testcase(
    'eWallet ID',
    '012345678901234',
    { },
    '00020101021129390016A00000067701011103150123456789012345802TH530376463049781'
  )
})

describe('Amount setting', () => {
  testcase(
    'Amount',
    '000-000-0000',
    { amount: 4.22 },
    '00020101021229370016A000000677010111011300660000000005802TH530376454044.226304E469'
  )
})
