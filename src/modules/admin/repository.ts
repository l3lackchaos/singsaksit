import { createSupabaseServerClient } from '@/lib/supabase/server';
import type {
  OrderStatus,
  PaymentStatus,
  ProductStatus,
} from '@/lib/supabase/database.types';

export interface ReviewQueueItem {
  orderId: string;
  orderNo: string;
  amount: number;
  method: string;
  slipPath: string | null;
  buyer: string;
}

export async function getDashboardStats() {
  const sb = await createSupabaseServerClient();
  const [pendingReview, paidOrders, products, customers] = await Promise.all([
    sb.from('Payment').select('*', { count: 'exact', head: true }).eq('status', 'PENDING_REVIEW'),
    sb.from('Order').select('*', { count: 'exact', head: true }).eq('status', 'PAID'),
    sb.from('Product').select('*', { count: 'exact', head: true }),
    sb.from('Profile').select('*', { count: 'exact', head: true }),
  ]);
  return {
    pendingReview: pendingReview.count ?? 0,
    paidOrders: paidOrders.count ?? 0,
    products: products.count ?? 0,
    customers: customers.count ?? 0,
  };
}

export async function listReviewQueue(): Promise<ReviewQueueItem[]> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from('Payment')
    .select('amount,method,slipPath,Order(id,orderNo,Profile(email))')
    .eq('status', 'PENDING_REVIEW')
    .order('createdAt', { ascending: true });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const order = pickOne(r.Order) as { id: string; orderNo: string; Profile: unknown } | null;
    const profile = pickOne(order?.Profile) as { email: string } | null;
    return {
      orderId: order?.id ?? '',
      orderNo: order?.orderNo ?? '',
      amount: r.amount as number,
      method: r.method as string,
      slipPath: (r.slipPath as string | null) ?? null,
      buyer: profile?.email ?? '-',
    };
  });
}

export interface AdminOrderRow {
  id: string;
  orderNo: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus | null;
  total: number;
  createdAt: string;
}

export async function listAllOrders(): Promise<AdminOrderRow[]> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from('Order')
    .select('id,orderNo,status,total,createdAt,Payment(status)')
    .order('createdAt', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const payment = pickOne(r.Payment) as { status: PaymentStatus } | null;
    return {
      id: r.id as string,
      orderNo: r.orderNo as string,
      status: r.status as OrderStatus,
      paymentStatus: payment?.status ?? null,
      total: r.total as number,
      createdAt: r.createdAt as string,
    };
  });
}

export interface AdminProductRow {
  id: string;
  title: string;
  slug: string;
  price: number;
  stock: number;
  status: ProductStatus;
}

export async function listAllProducts(): Promise<AdminProductRow[]> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from('Product')
    .select('id,title,slug,price,stock,status')
    .order('updatedAt', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminProductRow[];
}

export async function getProduct(id: string): Promise<AdminProductRow & { description: string } | null> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from('Product')
    .select('id,title,slug,price,stock,status,description')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as (AdminProductRow & { description: string }) | null) ?? null;
}

export interface CmsPageRow {
  id: string;
  slug: string;
  title: string;
  body: string;
  published: boolean;
}

export async function listCmsPages(): Promise<CmsPageRow[]> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from('CmsPage')
    .select('id,slug,title,body,published')
    .order('updatedAt', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CmsPageRow[];
}

export async function getCmsPage(id: string): Promise<CmsPageRow | null> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from('CmsPage')
    .select('id,slug,title,body,published')
    .eq('id', id)
    .maybeSingle();
  return (data as CmsPageRow | null) ?? null;
}

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export async function listUsers(): Promise<UserRow[]> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from('Profile')
    .select('id,email,name,role,createdAt')
    .order('createdAt', { ascending: false });
  if (error) throw error;
  return (data ?? []) as UserRow[];
}

export interface ProductImageRow {
  id: string;
  storagePath: string;
  alt: string;
}

export async function getProductImages(productId: string): Promise<ProductImageRow[]> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from('ProductImage')
    .select('id,storagePath,alt')
    .eq('productId', productId)
    .order('sortOrder', { ascending: true });
  return (data ?? []) as ProductImageRow[];
}

export interface CouponRow {
  id: string;
  code: string;
  type: string;
  value: number;
  minTotal: number;
  active: boolean;
  usedCount: number;
}

export async function listCoupons(): Promise<CouponRow[]> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from('Coupon')
    .select('id,code,type,value,minTotal,active,usedCount')
    .order('createdAt', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CouponRow[];
}

export interface ShortLinkRow {
  code: string;
  targetUrl: string;
  clicks: number;
  createdAt: string;
}

export async function listShortLinks(): Promise<ShortLinkRow[]> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from('ShortLink')
    .select('code,targetUrl,clicks,createdAt')
    .order('createdAt', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ShortLinkRow[];
}

export async function getAllSettings(): Promise<Record<string, unknown>> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from('GlobalSetting').select('key,value');
  const map: Record<string, unknown> = {};
  for (const row of data ?? []) {
    const r = row as { key: string; value: unknown };
    map[r.key] = r.value;
  }
  return map;
}

function pickOne(value: unknown): unknown {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}
