import { describe, expect, it } from 'vitest';
import { buildPromptPayPayload } from './promptpay';

describe('promptpay payload', () => {
  it('produces an EMVCo string that encodes the amount', () => {
    const payload = buildPromptPayPayload('0812345678', 150000); // 1,500.00 THB
    // EMVCo payloads start with the payload format indicator "00".
    expect(payload.startsWith('00')).toBe(true);
    // Amount field (tag 54) should carry the baht value.
    expect(payload).toContain('1500.00');
    // Static vs dynamic + CRC make it reasonably long.
    expect(payload.length).toBeGreaterThan(50);
  });

  it('is deterministic for the same inputs', () => {
    const a = buildPromptPayPayload('0812345678', 50000);
    const b = buildPromptPayPayload('0812345678', 50000);
    expect(a).toBe(b);
  });
});
