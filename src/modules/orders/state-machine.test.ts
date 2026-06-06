import { describe, expect, it } from 'vitest';
import {
  assertOrderTransition,
  assertPaymentTransition,
  canTransitionOrder,
  canTransitionPayment,
  canTransitionShipment,
  InvalidTransitionError,
} from './state-machine';

describe('order state machine', () => {
  it('allows the happy path', () => {
    expect(canTransitionOrder('PENDING_PAYMENT', 'AWAITING_CONFIRMATION')).toBe(true);
    expect(canTransitionOrder('AWAITING_CONFIRMATION', 'PAID')).toBe(true);
    expect(canTransitionOrder('PAID', 'PROCESSING')).toBe(true);
    expect(canTransitionOrder('PROCESSING', 'SHIPPED')).toBe(true);
    expect(canTransitionOrder('SHIPPED', 'DELIVERED')).toBe(true);
  });

  it('rejects skipping steps', () => {
    expect(canTransitionOrder('PENDING_PAYMENT', 'SHIPPED')).toBe(false);
    expect(canTransitionOrder('PENDING_PAYMENT', 'PAID')).toBe(false);
  });

  it('treats terminal states as final', () => {
    expect(canTransitionOrder('DELIVERED', 'REFUNDED')).toBe(false);
    expect(canTransitionOrder('CANCELLED', 'PENDING_PAYMENT')).toBe(false);
  });

  it('throws InvalidTransitionError on an illegal transition', () => {
    expect(() => assertOrderTransition('PENDING_PAYMENT', 'DELIVERED')).toThrowError(
      InvalidTransitionError,
    );
  });
});

describe('payment state machine', () => {
  it('advances slip review to paid', () => {
    expect(canTransitionPayment('PENDING', 'PENDING_REVIEW')).toBe(true);
    expect(canTransitionPayment('PENDING_REVIEW', 'PAID')).toBe(true);
  });

  it('lets a rejected slip be re-submitted', () => {
    expect(canTransitionPayment('PENDING_REVIEW', 'REJECTED')).toBe(true);
    expect(canTransitionPayment('REJECTED', 'PENDING_REVIEW')).toBe(true);
  });

  it('keeps PAID terminal', () => {
    expect(canTransitionPayment('PAID', 'REJECTED')).toBe(false);
    expect(() => assertPaymentTransition('PAID', 'PENDING')).toThrow();
  });
});

describe('shipment state machine', () => {
  it('follows the carrier lifecycle', () => {
    expect(canTransitionShipment('PREPARING', 'SHIPPED')).toBe(true);
    expect(canTransitionShipment('SHIPPED', 'IN_TRANSIT')).toBe(true);
    expect(canTransitionShipment('IN_TRANSIT', 'DELIVERED')).toBe(true);
  });

  it('cannot go backwards', () => {
    expect(canTransitionShipment('DELIVERED', 'SHIPPED')).toBe(false);
  });
});
