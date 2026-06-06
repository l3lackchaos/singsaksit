'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { bahtToSatang } from '@/lib/money';
import { slugify } from '@/modules/catalog/slug';

export interface ActionResult {
  error?: string;
  success?: string;
}

export async function confirmPaymentAction(orderId: string): Promise<ActionResult> {
  await requireAdmin();
  const sb = await createSupabaseServerClient();
  const { error } = await sb.rpc('confirm_payment', { p_order_id: orderId });
  revalidatePath('/admin/payments');
  revalidatePath('/admin/orders');
  if (error) return { error: error.message };
  return { success: 'ยืนยันการชำระเงินแล้ว' };
}

export async function rejectPaymentAction(
  orderId: string,
  reason: string,
): Promise<ActionResult> {
  await requireAdmin();
  const sb = await createSupabaseServerClient();
  const { error } = await sb.rpc('reject_payment', {
    p_order_id: orderId,
    p_reason: reason || 'สลิปไม่ถูกต้อง',
  });
  revalidatePath('/admin/payments');
  if (error) return { error: error.message };
  return { success: 'ปฏิเสธสลิปแล้ว' };
}

export async function shipOrderAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const schema = z.object({
    orderId: z.string().min(1),
    carrier: z.string().min(1, 'กรุณากรอกขนส่ง'),
    tracking: z.string().min(1, 'กรุณากรอกเลขพัสดุ'),
  });
  const parsed = schema.safeParse({
    orderId: formData.get('orderId'),
    carrier: formData.get('carrier'),
    tracking: formData.get('tracking'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' };

  const sb = await createSupabaseServerClient();
  const { error } = await sb.rpc('ship_order', {
    p_order_id: parsed.data.orderId,
    p_carrier: parsed.data.carrier,
    p_tracking: parsed.data.tracking,
  });
  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  if (error) return { error: error.message };
  return { success: 'บันทึกการจัดส่งแล้ว' };
}

export async function upsertProductAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const schema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, 'กรุณากรอกชื่อ').max(200),
    slug: z.string().max(200).optional(),
    priceBaht: z.coerce.number().min(0),
    stock: z.coerce.number().int().min(0),
    status: z.enum(['DRAFT', 'ACTIVE', 'SOLD_OUT', 'ARCHIVED']),
    description: z.string().max(5000).optional(),
  });
  const parsed = schema.safeParse({
    id: formData.get('id') || undefined,
    title: formData.get('title'),
    slug: formData.get('slug') || undefined,
    priceBaht: formData.get('priceBaht'),
    stock: formData.get('stock'),
    status: formData.get('status'),
    description: formData.get('description') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' };

  const sb = await createSupabaseServerClient();
  const slug = parsed.data.slug?.trim() || slugify(parsed.data.title);
  const payload = {
    title: parsed.data.title,
    slug,
    price: bahtToSatang(parsed.data.priceBaht),
    stock: parsed.data.stock,
    status: parsed.data.status,
    description: parsed.data.description ?? '',
    updatedAt: new Date().toISOString(),
  };

  if (parsed.data.id) {
    const { error } = await sb.from('Product').update(payload).eq('id', parsed.data.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await sb
      .from('Product')
      .insert({ id: crypto.randomUUID(), ...payload });
    if (error) return { error: error.message };
  }

  revalidatePath('/admin/products');
  revalidatePath('/products');
  return { success: 'บันทึกสินค้าแล้ว' };
}

export async function updateSettingsAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const sb = await createSupabaseServerClient();

  const updates: Array<{ key: string; value: unknown }> = [
    { key: 'store.name', value: String(formData.get('store.name') ?? 'สิ่งศักดิ์สิทธิ์') },
    { key: 'display.showStock', value: formData.get('display.showStock') === 'on' },
    { key: 'display.lowStockBadge', value: formData.get('display.lowStockBadge') === 'on' },
    { key: 'theme.default', value: String(formData.get('theme.default') ?? 'system') },
    { key: 'payment.promptpayId', value: String(formData.get('payment.promptpayId') ?? '') },
    {
      key: 'shipping.fee',
      value: bahtToSatang(Number(formData.get('shipping.feeBaht') ?? 0)),
    },
    { key: 'feature.couponsEnabled', value: formData.get('feature.couponsEnabled') === 'on' },
    { key: 'feature.reviewsEnabled', value: formData.get('feature.reviewsEnabled') === 'on' },
  ];

  for (const u of updates) {
    const { error } = await sb
      .from('GlobalSetting')
      .update({ value: u.value, updatedAt: new Date().toISOString() })
      .eq('key', u.key);
    if (error) return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: 'บันทึกการตั้งค่าแล้ว' };
}
