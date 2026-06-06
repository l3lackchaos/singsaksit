import generatePayload from 'promptpay-qr';
import QRCode from 'qrcode';
import { satangToBaht } from '@/lib/money';

/**
 * Build the EMVCo payload string for a PromptPay transfer of `amountSatang`
 * to `promptpayId` (a phone number or national ID). Amount is converted to baht.
 */
export function buildPromptPayPayload(promptpayId: string, amountSatang: number): string {
  return generatePayload(promptpayId, { amount: satangToBaht(amountSatang) });
}

/** Render the PromptPay payload as a PNG data URL for an <img>. */
export async function promptPayQrDataUrl(
  promptpayId: string,
  amountSatang: number,
): Promise<string> {
  const payload = buildPromptPayPayload(promptpayId, amountSatang);
  return QRCode.toDataURL(payload, { margin: 1, width: 320 });
}
