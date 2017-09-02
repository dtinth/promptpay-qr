# promptpay-qr

Web app, command line app, and library to generate QR Code payload for PromptPay.


## Introduction

The Bank of Thailand [introduced a **PromptPay QRCode Standard**](https://thestandard.co/standardqrcode/).

By generating a QR code, users of mobile banking apps in Thailand can scan the QR code, and transfer money to your PromptPay account instantly.

**Contents:**

- [**Mobile app**](#mobile-web-app) — Receive money from your home screen.

- [**Command-line application**](#cli) — Receive money from your terminal.

- [**`promptpay-qr` JavaScript API**](#api) — Generate a PromptPay QR code programmatically.


## Mobile web app

**You can quickly receive money from your home screen.**

<img src="images/mobile.png" width="324" height="451" align="right" />

For example, if you want to collect 80 Baht from each friend, you can open the app, type in 80, and show the QR code.
[It takes less than 5 seconds](https://www.facebook.com/dtinth/videos/10208543817227100/).

To use it:

1. Open **Chrome** (on Android) or **Safari** (iOS).

2. Go to **https://promptpay-qr.firebaseapp.com/**.

3. Set your PromptPay ID.

4. “Add to Home Screen.”

Features:

- The app remembers your PromptPay ID, so you don’t have to enter the information each time.

- It is a **Progressive Web App**, so you can add to home screen and it will work offline (Android).


## CLI

**You can receive money from your terminal.**

<p align="center">
  <img src="images/terminal.png" width="382" height="495" />
</p>

Install Node.js and run this command to install `promptpay-qr` in your machine:

```
npm install -g promptpay-qr
```

Run this command to generate a QR code:

```
promptpay-qr 081-xxx-xxxx
promptpay-qr 1-xxxx-xxxxx-xx-x --amount 4.22
```

Then QR code will be printed in the terminal.


## API

**[`promptpay-qr` is available on npm](https://www.npmjs.com/package/promptpay-qr).**
You can use this library to in your JavaScript app to generate a PromptPay QR code.
[See code example](https://runkit.com/dtinth/promptpay-qr).

```
generatePayload(idOrPhoneNo, { amount })
```

Returns a string which should be rendered as a QR code.


## References

- https://www.blognone.com/node/95133
- https://www.emvco.com/emv-technologies/qrcodes/
