'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';
import { emailSchema, signInSchema, signUpSchema } from './schema';

export interface AuthState {
  error?: string;
  success?: string;
}

type Provider = 'google' | 'facebook';

export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' };
  }

  const sb = await createSupabaseServerClient();
  const { error } = await sb.auth.signInWithPassword(parsed.data);
  if (error) return { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };

  const next = (formData.get('next') as string) || '/account';
  redirect(next);
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' };
  }

  const sb = await createSupabaseServerClient();
  const { error } = await sb.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { name: parsed.data.name },
      emailRedirectTo: `${env.siteUrl}/auth/callback`,
    },
  });
  if (error) return { error: error.message };

  return { success: 'สมัครสำเร็จ! กรุณาตรวจอีเมลเพื่อยืนยันบัญชีก่อนเข้าสู่ระบบ' };
}

export async function requestPasswordResetAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = emailSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'อีเมลไม่ถูกต้อง' };

  const sb = await createSupabaseServerClient();
  await sb.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${env.siteUrl}/auth/callback?next=/account`,
  });
  // Always report success to avoid leaking which emails are registered.
  return { success: 'หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านให้แล้ว' };
}

export async function signInWithProviderAction(provider: Provider) {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${env.siteUrl}/auth/callback` },
  });
  if (error || !data.url) redirect('/sign-in?error=oauth');
  redirect(data.url);
}

export async function signOutAction() {
  const sb = await createSupabaseServerClient();
  await sb.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}
