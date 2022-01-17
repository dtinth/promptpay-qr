/**
 * The `promptpay-qr` npm package provides a function to generate a PromptPay QR code that can be scanned by mobile banking apps.
 * @remarks
 * A {@link https://www.blognone.com/node/95133 | PromptPay QR code} payload format is based on the {@link https://www.emvco.com/emv-technologies/qrcodes/ | EMV QR Code specification}.
 * Specifically, the Merchant-Presented Mode is supported by this library.
 *
 * This package is a CommonJS module. Import the {@link (generatePayload:function)} function from CommonJS code like this:
 * ```
 * const generatePayload = require('promptpay-qr')
 * ```
 *
 * If you use ES modules, you can use the default import syntax:
 * ```
 * import generatePayload from 'promptpay-qr'
 * ```
 *
 * If you use TypeScript, make sure to set `"esModuleInterop": true` in the `tsconfig.json` file.
 * @packageDocumentation
 */

/**
 * Generates a PromptPay QR payload.
 * @remarks
 * This package is a CommonJS module. Import this function from CommonJS code like this:
 * ```
 * const generatePayload = require('promptpay-qr')
 * ```
 *
 * If you use ES modules, you can use the default import syntax:
 * ```
 * import generatePayload from 'promptpay-qr'
 * ```
 *
 * If you use TypeScript, make sure to set `"esModuleInterop": true` in the `tsconfig.json` file.
 * @param target - The target PromptPay ID. This can be a phone number (10 digits), a citizen ID (13 digits), a tax ID (13 digits), or an e-Wallet account ID (15 digits).
 * @param options - Options for generating a PromptPay QR payload
 * @returns A PromptPay QR payload. Use this payload to generate a QR code that can be scanned by mobile banking apps in Thailand.
 * @example Generate a PromptPay QR payload for a phone number
 * ```
 * generatePayload('0812345678', {})
 * ```
 * @example Generate a PromptPay QR payload for a phone number with a fixed amount
 * ```
 * generatePayload('0812345678', { amount: 4.22 })
 * ```
 * @public
 */
export function generatePayload(
  target: string,
  options: generatePayload.Options
): string;

/**
 * This namespace exports the types that can be used with the {@link (generatePayload:function)} function.
 * @public
 */
export namespace generatePayload {
  /**
   * Options to pass to {@link (generatePayload:function)}.
   */
  export interface Options {
    /**
     * The amount of money.
     * @remarks
     * If specified, some banking apps will prefill the amount field.
     */
    amount?: number;
  }
}
