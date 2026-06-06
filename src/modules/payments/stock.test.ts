import { describe, expect, it } from 'vitest';
import { decideStockDecrement } from './stock';

describe('stock decrement (oversell guard)', () => {
  it('decrements when stock is sufficient', () => {
    const d = decideStockDecrement(5, 2, 'ACTIVE');
    expect(d.ok).toBe(true);
    expect(d.newStock).toBe(3);
    expect(d.newStatus).toBe('ACTIVE');
  });

  it('flips to SOLD_OUT at zero', () => {
    const d = decideStockDecrement(1, 1, 'ACTIVE');
    expect(d.ok).toBe(true);
    expect(d.newStock).toBe(0);
    expect(d.newStatus).toBe('SOLD_OUT');
  });

  it('refuses to oversell the last unit (second confirmation)', () => {
    const d = decideStockDecrement(0, 1, 'ACTIVE');
    expect(d.ok).toBe(false);
    expect(d.reason).toBe('INSUFFICIENT_STOCK');
    expect(d.newStock).toBe(0); // never driven negative
  });

  it('rejects non-positive quantities', () => {
    expect(decideStockDecrement(5, 0, 'ACTIVE').ok).toBe(false);
  });
});
