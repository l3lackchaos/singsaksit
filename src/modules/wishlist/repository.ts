import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ProductListItem } from '@/modules/catalog/types';

export async function listWishlist(): Promise<ProductListItem[]> {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return [];

  const { data, error } = await sb
    .from('WishlistItem')
    .select('Product(id,slug,title,price,stock,lowStockThreshold,status)')
    .eq('userId', user.id)
    .order('createdAt', { ascending: false });

  if (error) throw error;

  return (data ?? [])
    .map((row) => {
      const p = (row as { Product: unknown }).Product;
      const product = Array.isArray(p) ? p[0] : p;
      return product as ProductListItem | undefined;
    })
    .filter((p): p is ProductListItem => Boolean(p))
    .map((p) => ({ ...p, imagePath: null }));
}

export async function isInWishlist(productId: string): Promise<boolean> {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return false;
  const { data } = await sb
    .from('WishlistItem')
    .select('id')
    .eq('userId', user.id)
    .eq('productId', productId)
    .maybeSingle();
  return Boolean(data);
}
