import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Role } from '@/lib/supabase/database.types';

export interface CurrentProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: Role;
}

export async function getUser() {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  return user;
}

export async function getProfile(): Promise<CurrentProfile | null> {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;

  const { data } = await sb
    .from('Profile')
    .select('id,email,name,phone,role')
    .eq('id', user.id)
    .maybeSingle();

  return (data as CurrentProfile | null) ?? null;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect('/sign-in');
  return user;
}

export async function requireAdmin(): Promise<CurrentProfile> {
  const profile = await getProfile();
  if (!profile) redirect('/sign-in');
  if (profile.role !== 'ADMIN' && profile.role !== 'STAFF') redirect('/');
  return profile;
}
