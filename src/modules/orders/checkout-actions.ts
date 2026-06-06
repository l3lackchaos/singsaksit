'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sendTemplate } from '@/lib/email';
import { formatThb } from '@/lib/money';
import { checkRateLimit, rateLimitId } from '@/lib/rate-limit';

const addressSchema = z.object({
  recipient: z.string().min(1).max(120),
  phone: z.string().min(6).max(20),
  line1: z.string().min(1).max(200),
  subdistrict: z.string().min(1).max(80),
  district: z.string().min(1).max(80),
  province: z.string().min(1).max(80),
  postalCode: z.string().min(4).max(10),
});

const inputSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().min(1), qty: z.number().int().positive() }))
    .min(1),
  address: addressSchema,
  method: z.enum(['PROMPTPAY', 'BANK_TRANSFER']),
  coupon: z.string().max(40).optional(),
});

export interface CreateOrderResult {
  orderId?: string;
  error?: string;
}

export async function createOrderAction(
  input: z.infer<typeof inputSchema>,
): Promise<CreateOrderResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' };
  }

  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { error: 'กรุณาเข้าสู่ระบบก่อนสั่งซื้อ' };

  const ok = await checkRateLimit('order', await rateLimitId(user.id), {
    limit: 15,
    windowSec: 60,
  });
  if (!ok) return { error: 'ทำรายการบ่อยเกินไป โปรดลองใหม่อีกครั้งในอีกสักครู่' };

  const { data, error } = await sb.rpc('create_order', {
    p_items: parsed.data.items,
    p_address: parsed.data.address,
    p_method: parsed.data.method,
    p_coupon: parsed.data.coupon ?? null,
  });

  if (error) {
    return { error: translateError(error.message) };
  }

  const row = Array.isArray(data) ? data[0] : data;
  const orderId = (row as { order_id: string; order_no: string } | null)?.order_id;
  const orderNo = (row as { order_no: string } | null)?.order_no ?? '';
  if (!orderId) return { error: 'สร้างคำสั่งซื้อไม่สำเร็จ' };

  if (user.email) {
    const { data: ord } = await sb.from('Order').select('total').eq('id', orderId).maybeSingle();
    const total = (ord as { total: number } | null)?.total ?? 0;
    await sendTemplate(user.email, 'order_received', {
      orderNo,
      total: formatThb(total),
    });
  }

  revalidatePath('/account/orders');
  return { orderId };
}

export interface SlipState {
  error?: string;
  ok?: boolean;
}

// Upload the slip server-side (authenticated session → storage RLS) then advance
// the payment to PENDING_REVIEW. More reliable than uploading from the browser.
export async function uploadSlipAction(
  _prev: SlipState,
  formData: FormData,
): Promise<SlipState> {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { error: 'กรุณาเข้าสู่ระบบ' };

  const orderId = String(formData.get('orderId') ?? '');
  const file = formData.get('slip');
  if (!orderId || !(file instanceof File) || file.size === 0) {
    return { error: 'กรุณาเลือกไฟล์สลิป' };
  }
  if (file.size > 8 * 1024 * 1024) return { error: 'ไฟล์ใหญ่เกิน 8MB' };

  const ok = await checkRateLimit('slip', await rateLimitId(user.id), {
    limit: 20,
    windowSec: 60,
  });
  if (!ok) return { error: 'อัปโหลดบ่อยเกินไป โปรดลองใหม่อีกครั้ง' };

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${user.id}/${orderId}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await sb.storage.from('slips').upload(path, buffer, {
    contentType: file.type || 'image/jpeg',
    upsert: true,
  });
  if (upErr) return { error: 'อัปโหลดสลิปไม่สำเร็จ' };

  const { error } = await sb.rpc('submit_payment_slip', {
    p_order_id: orderId,
    p_slip_path: path,
  });
  if (error) return { error: 'บันทึกสลิปไม่สำเร็จ' };

  revalidatePath(`/account/orders/${orderId}`);
  return { ok: true };
}

function translateError(message: string): string {
  if (message.includes('insufficient stock')) return 'สินค้าบางรายการมีไม่พอ';
  if (message.includes('empty cart')) return 'ตะกร้าว่างเปล่า';
  if (message.includes('invalid product')) return 'พบสินค้าที่ไม่พร้อมขาย';
  return 'เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่';
}
