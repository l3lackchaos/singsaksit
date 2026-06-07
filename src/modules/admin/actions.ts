'use server';

import { z } from 'zod';
import { revalidatePath, revalidateTag } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { CATALOG_TAG } from '@/modules/catalog/repository';
import { bahtToSatang } from '@/lib/money';
import { slugify } from '@/modules/catalog/slug';
import { sanitizeRichText } from '@/lib/sanitize';
import { logAudit } from './audit';
import { sendTemplate } from '@/lib/email';

async function orderRecipient(
  sb: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  orderId: string,
): Promise<{ orderNo: string; email: string | null }> {
  const { data } = await sb
    .from('Order')
    .select('orderNo,Profile(email)')
    .eq('id', orderId)
    .maybeSingle();
  const row = data as { orderNo: string; Profile: unknown } | null;
  const profile = Array.isArray(row?.Profile) ? row?.Profile[0] : row?.Profile;
  return {
    orderNo: row?.orderNo ?? '',
    email: (profile as { email?: string } | undefined)?.email ?? null,
  };
}

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
  revalidateTag(CATALOG_TAG);
  if (error) return { error: error.message };
  const rcpt = await orderRecipient(sb, orderId);
  if (rcpt.email) await sendTemplate(rcpt.email, 'payment_confirmed', { orderNo: rcpt.orderNo });
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

export async function refundOrderAction(orderId: string): Promise<ActionResult> {
  await requireAdmin();
  const sb = await createSupabaseServerClient();
  const { error } = await sb.rpc('refund_order', { p_order_id: orderId });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidateTag(CATALOG_TAG);
  if (error) return { error: error.message };
  return { success: 'คืนเงินและคืนสต็อกแล้ว' };
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
  const rcpt = await orderRecipient(sb, parsed.data.orderId);
  if (rcpt.email)
    await sendTemplate(rcpt.email, 'order_shipped', {
      orderNo: rcpt.orderNo,
      carrier: parsed.data.carrier,
      trackingNo: parsed.data.tracking,
    });
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
  revalidateTag(CATALOG_TAG);
  await logAudit(parsed.data.id ? 'update_product' : 'create_product', 'Product', parsed.data.id, {
    title: parsed.data.title,
  });
  return { success: 'บันทึกสินค้าแล้ว' };
}

export async function changeRoleAction(userId: string, role: string): Promise<ActionResult> {
  await requireAdmin();
  if (!['CUSTOMER', 'STAFF', 'ADMIN'].includes(role)) return { error: 'role ไม่ถูกต้อง' };
  const sb = await createSupabaseServerClient();
  const { error } = await sb
    .from('Profile')
    .update({ role, updatedAt: new Date().toISOString() })
    .eq('id', userId);
  if (error) return { error: error.message };
  await logAudit('change_role', 'Profile', userId, { role });
  revalidatePath('/admin/users');
  return { success: 'อัปเดตสิทธิ์แล้ว' };
}

export async function createShortLinkAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const schema = z.object({
    targetUrl: z.string().url('ลิงก์ปลายทางไม่ถูกต้อง'),
    code: z
      .string()
      .regex(/^[a-zA-Z0-9_-]*$/, 'ใช้ได้เฉพาะ a-z 0-9 - _')
      .max(40)
      .optional(),
  });
  const parsed = schema.safeParse({
    targetUrl: formData.get('targetUrl'),
    code: formData.get('code') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' };

  const code = parsed.data.code?.trim() || Math.random().toString(36).slice(2, 8);
  const sb = await createSupabaseServerClient();
  const { error } = await sb.from('ShortLink').insert({
    id: crypto.randomUUID(),
    code,
    targetUrl: parsed.data.targetUrl,
  });
  if (error) return { error: 'สร้างลิงก์ไม่สำเร็จ (โค้ดอาจซ้ำ)' };

  revalidatePath('/admin/links');
  return { success: `สร้างลิงก์ /s/${code} แล้ว` };
}

export async function upsertCmsPageAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const schema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, 'กรุณากรอกหัวข้อ').max(200),
    slug: z.string().max(200).optional(),
    body: z.string().max(50000).optional(),
    published: z.boolean(),
  });
  const parsed = schema.safeParse({
    id: formData.get('id') || undefined,
    title: formData.get('title'),
    slug: formData.get('slug') || undefined,
    body: formData.get('body') || '',
    published: formData.get('published') === 'on',
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' };

  const sb = await createSupabaseServerClient();
  const payload = {
    title: parsed.data.title,
    slug: parsed.data.slug?.trim() || slugify(parsed.data.title),
    body: sanitizeRichText(parsed.data.body ?? ''),
    published: parsed.data.published,
    updatedAt: new Date().toISOString(),
  };

  if (parsed.data.id) {
    const { error } = await sb.from('CmsPage').update(payload).eq('id', parsed.data.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await sb.from('CmsPage').insert({ id: crypto.randomUUID(), ...payload });
    if (error) return { error: 'บันทึกไม่สำเร็จ (slug อาจซ้ำ)' };
  }
  revalidatePath('/admin/pages');
  revalidatePath(`/pages/${payload.slug}`);
  return { success: 'บันทึกหน้าแล้ว' };
}

export async function createBannerAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const schema = z.object({
    title: z.string().min(1, 'กรุณากรอกหัวข้อ').max(200),
    body: z.string().max(500).optional(),
    href: z.string().max(500).optional(),
    published: z.boolean(),
  });
  const parsed = schema.safeParse({
    title: formData.get('title'),
    body: formData.get('body') || '',
    href: formData.get('href') || '',
    published: formData.get('published') === 'on',
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' };

  const sb = await createSupabaseServerClient();
  const { error } = await sb.from('Banner').insert({
    id: crypto.randomUUID(),
    title: parsed.data.title,
    body: parsed.data.body ?? '',
    href: parsed.data.href || null,
    published: parsed.data.published,
    updatedAt: new Date().toISOString(),
  });
  if (error) return { error: error.message };
  revalidatePath('/admin/banners');
  revalidatePath('/');
  return { success: 'เพิ่มแบนเนอร์แล้ว' };
}

export async function createCouponAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const schema = z.object({
    code: z.string().min(2, 'โค้ดอย่างน้อย 2 ตัว').max(40),
    type: z.enum(['PERCENT', 'FIXED', 'FREE_SHIPPING']),
    value: z.coerce.number().int().min(0),
    minTotalBaht: z.coerce.number().min(0),
  });
  const parsed = schema.safeParse({
    code: formData.get('code'),
    type: formData.get('type'),
    value: formData.get('value'),
    minTotalBaht: formData.get('minTotalBaht'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' };

  // For FIXED, value is in baht -> store satang.
  const value =
    parsed.data.type === 'FIXED' ? bahtToSatang(parsed.data.value) : parsed.data.value;

  const sb = await createSupabaseServerClient();
  const { error } = await sb.from('Coupon').insert({
    id: crypto.randomUUID(),
    code: parsed.data.code.toUpperCase(),
    type: parsed.data.type,
    value,
    minTotal: bahtToSatang(parsed.data.minTotalBaht),
    updatedAt: new Date().toISOString(),
  });
  if (error) return { error: 'สร้างคูปองไม่สำเร็จ (โค้ดอาจซ้ำ)' };
  await logAudit('create_coupon', 'Coupon', undefined, { code: parsed.data.code });
  revalidatePath('/admin/coupons');
  return { success: 'สร้างคูปองแล้ว' };
}

export async function toggleCouponAction(couponId: string, active: boolean): Promise<void> {
  await requireAdmin();
  const sb = await createSupabaseServerClient();
  await sb.from('Coupon').update({ active, updatedAt: new Date().toISOString() }).eq('id', couponId);
  revalidatePath('/admin/coupons');
}

export async function addProductImageAction(
  productId: string,
  path: string,
  alt: string,
): Promise<ActionResult> {
  await requireAdmin();
  const sb = await createSupabaseServerClient();
  const { count } = await sb
    .from('ProductImage')
    .select('*', { count: 'exact', head: true })
    .eq('productId', productId);
  const { error } = await sb.from('ProductImage').insert({
    id: crypto.randomUUID(),
    productId,
    storagePath: path,
    alt,
    sortOrder: count ?? 0,
  });
  if (error) return { error: error.message };
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath('/products');
  revalidateTag(CATALOG_TAG);
  return { success: 'เพิ่มรูปแล้ว' };
}

export async function deleteProductImageAction(
  imageId: string,
  productId: string,
  path: string,
): Promise<void> {
  await requireAdmin();
  const sb = await createSupabaseServerClient();
  await sb.from('ProductImage').delete().eq('id', imageId);
  await sb.storage.from('products').remove([path]);
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath('/products');
  revalidateTag(CATALOG_TAG);
}

export async function updateEmailTemplateAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const schema = z.object({
    id: z.string().min(1),
    subject: z.string().min(1, 'กรุณากรอกหัวข้อ').max(300),
    body: z.string().min(1, 'กรุณากรอกเนื้อหา').max(20000),
  });
  const parsed = schema.safeParse({
    id: formData.get('id'),
    subject: formData.get('subject'),
    body: formData.get('body'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' };

  const sb = await createSupabaseServerClient();
  const { error } = await sb
    .from('EmailTemplate')
    .update({ subject: parsed.data.subject, body: parsed.data.body, updatedAt: new Date().toISOString() })
    .eq('id', parsed.data.id);
  if (error) return { error: error.message };
  await logAudit('update_email_template', 'EmailTemplate', parsed.data.id);
  revalidatePath('/admin/emails');
  return { success: 'บันทึกเทมเพลตแล้ว' };
}

export async function updateSettingsAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const sb = await createSupabaseServerClient();

  const updates: Array<{ key: string; value: unknown }> = [
    { key: 'store.name', value: String(formData.get('store.name') ?? 'สิ่งศักดิ์สิทธิ์') },
    { key: 'contact.email', value: String(formData.get('contact.email') ?? '') },
    { key: 'contact.phone', value: String(formData.get('contact.phone') ?? '') },
    { key: 'contact.lineId', value: String(formData.get('contact.lineId') ?? '') },
    { key: 'contact.facebookUrl', value: String(formData.get('contact.facebookUrl') ?? '') },
    { key: 'contact.hours', value: String(formData.get('contact.hours') ?? '') },
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
