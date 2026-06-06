// Stock decrement decision (docs/SPEC.md §2). Stock is only reduced when a payment
// is confirmed (Payment → PAID), and the actual DB write must be atomic
// (`UPDATE ... WHERE stock >= qty` inside a transaction). This pure helper decides
// the outcome so it can be unit-tested and reused by the service layer.

import type { ProductStatus } from '@prisma/client';

export interface StockDecision {
  ok: boolean;
  /** Stock value to persist when ok; unchanged value when not ok. */
  newStock: number;
  /** Product status after the decrement (flips to SOLD_OUT at zero). */
  newStatus: ProductStatus;
  reason?: 'INSUFFICIENT_STOCK';
}

export function decideStockDecrement(
  currentStock: number,
  qty: number,
  currentStatus: ProductStatus,
): StockDecision {
  if (qty <= 0 || currentStock < qty) {
    return {
      ok: false,
      newStock: currentStock,
      newStatus: currentStatus,
      reason: 'INSUFFICIENT_STOCK',
    };
  }
  const newStock = currentStock - qty;
  const newStatus: ProductStatus =
    newStock === 0 && currentStatus === 'ACTIVE' ? 'SOLD_OUT' : currentStatus;
  return { ok: true, newStock, newStatus };
}
