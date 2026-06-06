// Order / Payment / Shipment state machines — the spine of the order domain
// (docs/SPEC.md §2). Status changes MUST go through these guards; never mutate a
// status directly. Each map lists the allowed target states for a given state.

import type { OrderStatus, PaymentStatus, ShipmentStatus } from '@prisma/client';

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['AWAITING_CONFIRMATION', 'CANCELLED'],
  AWAITING_CONFIRMATION: ['PAID', 'PENDING_PAYMENT', 'CANCELLED'],
  PAID: ['PROCESSING', 'REFUNDED'],
  PROCESSING: ['SHIPPED', 'REFUNDED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
};

const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  PENDING: ['PENDING_REVIEW'],
  PENDING_REVIEW: ['PAID', 'REJECTED'],
  REJECTED: ['PENDING_REVIEW', 'PENDING'],
  PAID: [],
};

const SHIPMENT_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  PREPARING: ['SHIPPED'],
  SHIPPED: ['IN_TRANSIT', 'DELIVERED'],
  IN_TRANSIT: ['DELIVERED'],
  DELIVERED: [],
};

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from].includes(to);
}

export function canTransitionPayment(from: PaymentStatus, to: PaymentStatus): boolean {
  return PAYMENT_TRANSITIONS[from].includes(to);
}

export function canTransitionShipment(from: ShipmentStatus, to: ShipmentStatus): boolean {
  return SHIPMENT_TRANSITIONS[from].includes(to);
}

export class InvalidTransitionError extends Error {
  constructor(
    public readonly domain: 'order' | 'payment' | 'shipment',
    public readonly from: string,
    public readonly to: string,
  ) {
    super(`Invalid ${domain} transition: ${from} → ${to}`);
    this.name = 'InvalidTransitionError';
  }
}

/** Throws InvalidTransitionError if the transition is not allowed; returns `to` otherwise. */
export function assertOrderTransition(from: OrderStatus, to: OrderStatus): OrderStatus {
  if (!canTransitionOrder(from, to)) {
    throw new InvalidTransitionError('order', from, to);
  }
  return to;
}

export function assertPaymentTransition(
  from: PaymentStatus,
  to: PaymentStatus,
): PaymentStatus {
  if (!canTransitionPayment(from, to)) {
    throw new InvalidTransitionError('payment', from, to);
  }
  return to;
}

export function assertShipmentTransition(
  from: ShipmentStatus,
  to: ShipmentStatus,
): ShipmentStatus {
  if (!canTransitionShipment(from, to)) {
    throw new InvalidTransitionError('shipment', from, to);
  }
  return to;
}
