'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface ProfileState {
  error?: string;
  success?: string;
}

const profileSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อ').max(120),
  phone: z
    .string()
    .max(20)
    .regex(/^[0-9+\-\s]*$/, 'เบอร์โทรไม่ถูกต้อง')
    .optional()
    .or(z.literal('')),
});

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { error: 'กรุณาเข้าสู่ระบบ' };

  const parsed = profileSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone') ?? '',
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' };
  }

  const { error } = await sb
    .from('Profile')
    .update({
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/account');
  return { success: 'บันทึกข้อมูลแล้ว' };
}
