import type {
  OrderStatus,
  PaymentStatus,
  ShipmentStatus,
} from '@/lib/supabase/database.types';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'รอชำระเงิน',
  AWAITING_CONFIRMATION: 'รอตรวจสอบสลิป',
  PAID: 'ชำระเงินแล้ว',
  PROCESSING: 'กำลังเตรียมจัดส่ง',
  SHIPPED: 'จัดส่งแล้ว',
  DELIVERED: 'จัดส่งสำเร็จ',
  CANCELLED: 'ยกเลิก',
  REFUNDED: 'คืนเงินแล้ว',
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: 'รอชำระเงิน',
  PENDING_REVIEW: 'รอตรวจสอบ',
  PAID: 'ชำระแล้ว',
  REJECTED: 'ปฏิเสธ',
};

export const SHIPMENT_STATUS_LABEL: Record<ShipmentStatus, string> = {
  PREPARING: 'กำลังเตรียม',
  SHIPPED: 'จัดส่งแล้ว',
  IN_TRANSIT: 'ระหว่างขนส่ง',
  DELIVERED: 'ถึงปลายทาง',
};
