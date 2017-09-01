# promptpay-qr

Web app, CLI app, and library to generate QR Code payload for PromptPay.

## CLI

```
npx promptpay-qr 081-xxx-xxxx
npx promptpay-qr 1-xxxx-xxxxx-xx-x --amount 4.22
```

QR code will be printed in the terminal

- `--amount 4.22` Specify the amount in THB.

## Mobile Web

On your phone, you can go to https://promptpay-qr.firebaseapp.com/ to access the web version.

- Your PromptPay ID is stored, so you don’t have to enter the information each visit.
- It is a progressive web app, so you can add to home screen and it will work offline (Android).

## API

```
generatePayload(idOrPhoneNo, { amount })
```

Returns a string which should be rendered as a QR code.

## References

- https://www.blognone.com/node/95133
- https://www.emvco.com/emv-technologies/qrcodes/
