# promptpay-qr

Library to generate QR Code payload for PromptPay.

## CLI

```
npx promptpay-qr 081-xxx-xxxx
npx promptpay-qr 1-xxxx-xxxxx-xx-x --amount 4.22
```

## API

```
generatePayload(idOrPhoneNo, { amount })
```
