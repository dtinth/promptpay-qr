# promptpay-qr

Library to generate QR Code payload for PromptPay.

## CLI

```
npx promptpay-qr 081-xxx-xxxx
npx promptpay-qr 1-xxxx-xxxxx-xx-x --amount 4.22
```

QR code will be printed in the terminal

- `--amount 4.22` Specify the amount in THB.
- `--small` Render a smaller QR code (may not work in every system).

## API

```
generatePayload(idOrPhoneNo, { amount })
```
