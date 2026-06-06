// Coupon discount engine (docs/SPEC.md §1 Coupon). Pure calculation over satang.
// Eligibility (usage limits, per-user limits, active window) is enforced in the
// service layer against the DB; this module only computes the monetary effect.

import type { CouponType } from '@prisma/client';

export interface CouponInput {
  type: CouponType;
  value: number; // PERCENT: 0..100, FIXED: satang
  minTotal: number; // satang
  maxDiscount?: number | null; // satang cap (PERCENT)
}

export interface DiscountResult {
  applicable: boolean;
  reason?: 'BELOW_MIN_TOTAL';
  /** Discount applied to the items subtotal (satang). */
  discount: number;
  /** Shipping discount (satang) — set for FREE_SHIPPING. */
  shippingDiscount: number;
}

export function calculateDiscount(
  coupon: CouponInput,
  subtotal: number,
  shippingFee: number,
): DiscountResult {
  const base: DiscountResult = { applicable: true, discount: 0, shippingDiscount: 0 };

  if (subtotal < coupon.minTotal) {
    return { ...base, applicable: false, reason: 'BELOW_MIN_TOTAL' };
  }

  switch (coupon.type) {
    case 'PERCENT': {
      let discount = Math.round((subtotal * coupon.value) / 100);
      if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
      return { ...base, discount: Math.min(discount, subtotal) };
    }
    case 'FIXED':
      return { ...base, discount: Math.min(coupon.value, subtotal) };
    case 'FREE_SHIPPING':
      return { ...base, shippingDiscount: shippingFee };
    default:
      return base;
  }
}

/** Final payable total in satang after a coupon, never below zero. */
export function applyDiscount(
  subtotal: number,
  shippingFee: number,
  result: DiscountResult,
): number {
  const total = subtotal - result.discount + (shippingFee - result.shippingDiscount);
  return Math.max(0, total);
}
