'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface AddressState {
  error?: string;
  success?: string;
}

const addressSchema = z.object({
  recipient: z.string().min(1, 'กรุณากรอกชื่อผู้รับ').max(120),
  phone: z.string().min(6, 'เบอร์ไม่ถูกต้อง').max(20),
  line1: z.string().min(1, 'กรุณากรอกที่อยู่').max(200),
  subdistrict: z.string().min(1).max(80),
  district: z.string().min(1).max(80),
  province: z.string().min(1).max(80),
  postalCode: z.string().min(4).max(10),
});

export async function addAddressAction(
  _prev: AddressState,
  formData: FormData,
): Promise<AddressState> {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { error: 'กรุณาเข้าสู่ระบบ' };

  const parsed = addressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' };

  const { count } = await sb
    .from('Address')
    .select('*', { count: 'exact', head: true })
    .eq('userId', user.id);

  const { error } = await sb.from('Address').insert({
    id: crypto.randomUUID(),
    userId: user.id,
    ...parsed.data,
    isDefault: (count ?? 0) === 0,
  });
  if (error) return { error: error.message };

  revalidatePath('/account/addresses');
  return { success: 'บันทึกที่อยู่แล้ว' };
}

export async function deleteAddressAction(id: string): Promise<void> {
  const sb = await createSupabaseServerClient();
  await sb.from('Address').delete().eq('id', id);
  revalidatePath('/account/addresses');
}
