# promptpay-qr

Library to generate QR Code payload for PromptPay.

## CLI

```
npx promptpay-qr 081-xxx-xxxx
npx promptpay-qr 1-xxxx-xxxxx-xx-x --amount 4.22
```

QR code will be printed in the terminal

- `--amount 4.22` Specify the amount in THB.

## API

```
generatePayload(idOrPhoneNo, { amount })
```

Returns a string which should be rendered as a QR code.

## References

- https://www.blognone.com/node/95133
- https://www.emvco.com/emv-technologies/qrcodes/
