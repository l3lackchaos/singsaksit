import { createSupabaseServerClient } from '@/lib/supabase/server';
import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ShipmentStatus,
} from '@/lib/supabase/database.types';

export interface OrderSummary {
  id: string;
  orderNo: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
}

export interface OrderItemRow {
  id: string;
  title: string;
  price: number;
  qty: number;
}

export interface ShippingAddress {
  recipient: string;
  phone: string;
  line1: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
}

export interface OrderDetail extends OrderSummary {
  subtotal: number;
  shippingFee: number;
  discount: number;
  shippingAddress: ShippingAddress;
  items: OrderItemRow[];
  payment: {
    method: PaymentMethod;
    amount: number;
    status: PaymentStatus;
    slipPath: string | null;
    rejectReason: string | null;
  } | null;
  shipment: {
    carrier: string | null;
    trackingNo: string | null;
    status: ShipmentStatus;
  } | null;
}

export async function listUserOrders(): Promise<OrderSummary[]> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from('Order')
    .select('id,orderNo,status,total,createdAt')
    .order('createdAt', { ascending: false });
  if (error) throw error;
  return (data ?? []) as OrderSummary[];
}

export async function getOrderDetail(orderId: string): Promise<OrderDetail | null> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from('Order')
    .select(
      `id,orderNo,status,subtotal,shippingFee,discount,total,createdAt,shippingAddress,
       OrderItem(id,title,price,qty),
       Payment(method,amount,status,slipPath,rejectReason),
       Shipment(carrier,trackingNo,status)`,
    )
    .eq('id', orderId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as Record<string, unknown>;
  const payment = pickOne(row.Payment) as OrderDetail['payment'];
  const shipment = pickOne(row.Shipment) as OrderDetail['shipment'];

  return {
    id: row.id as string,
    orderNo: row.orderNo as string,
    status: row.status as OrderStatus,
    subtotal: row.subtotal as number,
    shippingFee: row.shippingFee as number,
    discount: row.discount as number,
    total: row.total as number,
    createdAt: row.createdAt as string,
    shippingAddress: row.shippingAddress as ShippingAddress,
    items: (row.OrderItem ?? []) as OrderItemRow[],
    payment,
    shipment,
  };
}

function pickOne(value: unknown): unknown {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}
