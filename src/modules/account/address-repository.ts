import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface SavedAddress {
  id: string;
  recipient: string;
  phone: string;
  line1: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export async function listAddresses(): Promise<SavedAddress[]> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from('Address')
    .select('id,recipient,phone,line1,subdistrict,district,province,postalCode,isDefault')
    .order('isDefault', { ascending: false });
  return (data ?? []) as SavedAddress[];
}
