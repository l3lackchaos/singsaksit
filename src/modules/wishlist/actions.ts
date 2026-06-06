'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function toggleWishlistAction(productId: string): Promise<{ saved: boolean }> {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect('/sign-in?next=/products');

  const { data: existing } = await sb
    .from('WishlistItem')
    .select('id')
    .eq('userId', user.id)
    .eq('productId', productId)
    .maybeSingle();

  if (existing) {
    await sb.from('WishlistItem').delete().eq('id', (existing as { id: string }).id);
    revalidatePath('/account/wishlist');
    return { saved: false };
  }

  await sb.from('WishlistItem').insert({
    id: crypto.randomUUID(),
    userId: user.id,
    productId,
  });
  revalidatePath('/account/wishlist');
  return { saved: true };
}
