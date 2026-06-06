'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';

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
  const orderId = (row as { order_id: string } | null)?.order_id;
  if (!orderId) return { error: 'สร้างคำสั่งซื้อไม่สำเร็จ' };

  revalidatePath('/account/orders');
  return { orderId };
}

export async function submitSlipAction(
  orderId: string,
  slipPath: string,
): Promise<{ error?: string }> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb.rpc('submit_payment_slip', {
    p_order_id: orderId,
    p_slip_path: slipPath,
  });
  if (error) return { error: error.message };
  revalidatePath(`/account/orders/${orderId}`);
  return {};
}

function translateError(message: string): string {
  if (message.includes('insufficient stock')) return 'สินค้าบางรายการมีไม่พอ';
  if (message.includes('empty cart')) return 'ตะกร้าว่างเปล่า';
  if (message.includes('invalid product')) return 'พบสินค้าที่ไม่พร้อมขาย';
  return 'เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่';
}
