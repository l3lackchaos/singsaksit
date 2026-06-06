import { describe, expect, it } from 'vitest';
import { applyDiscount, calculateDiscount } from './calculate';

describe('coupon discount engine', () => {
  it('rejects when subtotal is below minTotal', () => {
    const r = calculateDiscount(
      { type: 'PERCENT', value: 10, minTotal: 100000 },
      50000,
      5000,
    );
    expect(r.applicable).toBe(false);
    expect(r.reason).toBe('BELOW_MIN_TOTAL');
    expect(r.discount).toBe(0);
  });

  it('applies a percentage discount', () => {
    const r = calculateDiscount({ type: 'PERCENT', value: 10, minTotal: 0 }, 200000, 5000);
    expect(r.discount).toBe(20000);
    expect(applyDiscount(200000, 5000, r)).toBe(185000);
  });

  it('caps a percentage discount at maxDiscount', () => {
    const r = calculateDiscount(
      { type: 'PERCENT', value: 50, minTotal: 0, maxDiscount: 30000 },
      200000,
      5000,
    );
    expect(r.discount).toBe(30000);
  });

  it('applies a fixed discount but never exceeds subtotal', () => {
    expect(
      calculateDiscount({ type: 'FIXED', value: 50000, minTotal: 0 }, 30000, 5000).discount,
    ).toBe(30000);
    expect(
      calculateDiscount({ type: 'FIXED', value: 50000, minTotal: 0 }, 80000, 5000).discount,
    ).toBe(50000);
  });

  it('waives shipping for FREE_SHIPPING', () => {
    const r = calculateDiscount({ type: 'FREE_SHIPPING', value: 0, minTotal: 0 }, 80000, 5000);
    expect(r.shippingDiscount).toBe(5000);
    expect(applyDiscount(80000, 5000, r)).toBe(80000);
  });

  it('never returns a negative total', () => {
    const r = calculateDiscount({ type: 'FIXED', value: 999999, minTotal: 0 }, 10000, 0);
    expect(applyDiscount(10000, 0, r)).toBe(0);
  });
});
