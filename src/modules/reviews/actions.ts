'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { stripTags } from '@/lib/sanitize';

export interface ReviewState {
  error?: string;
  success?: string;
}

const schema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export async function submitReviewAction(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const parsed = schema.safeParse({
    productId: formData.get('productId'),
    rating: formData.get('rating'),
    comment: formData.get('comment') ?? '',
  });
  if (!parsed.success) return { error: 'ข้อมูลรีวิวไม่ถูกต้อง' };

  const sb = await createSupabaseServerClient();
  const { error } = await sb.rpc('submit_review', {
    p_product_id: parsed.data.productId,
    p_rating: parsed.data.rating,
    p_comment: stripTags(parsed.data.comment ?? ''),
  });
  if (error) {
    if (error.message.includes('no purchase'))
      return { error: 'รีวิวได้เฉพาะผู้ที่ซื้อสินค้านี้แล้ว' };
    if (error.message.includes('unauthenticated')) return { error: 'กรุณาเข้าสู่ระบบ' };
    return { error: 'ส่งรีวิวไม่สำเร็จ' };
  }
  revalidatePath('/product');
  return { success: 'ส่งรีวิวแล้ว รอแอดมินอนุมัติก่อนแสดงผล' };
}

export async function moderateReviewAction(
  reviewId: string,
  approve: boolean,
): Promise<void> {
  await requireAdmin();
  const sb = await createSupabaseServerClient();
  await sb
    .from('Review')
    .update({ status: approve ? 'APPROVED' : 'REJECTED' })
    .eq('id', reviewId);
  revalidatePath('/admin/reviews');
}
