// Generated from the Supabase schema. Regenerate with the Supabase MCP
// `generate_typescript_types` tool (or `supabase gen types`) after schema changes.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'SOLD_OUT' | 'ARCHIVED';
export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'AWAITING_CONFIRMATION'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';
export type PaymentMethod = 'PROMPTPAY' | 'BANK_TRANSFER';
export type PaymentStatus = 'PENDING' | 'PENDING_REVIEW' | 'PAID' | 'REJECTED';
export type ShipmentStatus = 'PREPARING' | 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED';
export type CouponType = 'PERCENT' | 'FIXED' | 'FREE_SHIPPING';
export type CouponScope = 'ALL' | 'CATEGORY' | 'PRODUCT';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ConsentType = 'COOKIE' | 'MARKETING' | 'TERMS';
export type Role = 'CUSTOMER' | 'STAFF' | 'ADMIN';
