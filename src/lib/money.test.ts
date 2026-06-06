import { describe, expect, it } from 'vitest';
import { bahtToSatang, satangToBaht, formatThb } from './money';

describe('money', () => {
  it('converts baht to satang as integers', () => {
    expect(bahtToSatang(1500)).toBe(150000);
    expect(bahtToSatang(19.99)).toBe(1999);
  });

  it('converts satang back to baht', () => {
    expect(satangToBaht(150000)).toBe(1500);
  });

  it('formats satang as THB currency', () => {
    // Intl may use different spacing/symbols across ICU versions; assert key parts.
    const out = formatThb(150000);
    expect(out).toContain('1,500');
  });
});
