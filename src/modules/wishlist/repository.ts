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
    .select(
      'Product(id,slug,title,price,stock,lowStockThreshold,status,ProductImage(storagePath,sortOrder))',
    )
    .eq('userId', user.id)
    .order('createdAt', { ascending: false });

  if (error) throw error;

  return (data ?? [])
    .map((row) => {
      const p = (row as { Product: unknown }).Product;
      return (Array.isArray(p) ? p[0] : p) as
        | (Omit<ProductListItem, 'imagePath'> & {
            ProductImage?: { storagePath: string; sortOrder: number }[];
          })
        | undefined;
    })
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => {
      const first = (p.ProductImage ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)[0];
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        price: p.price,
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        status: p.status,
        imagePath: first?.storagePath ?? null,
      };
    });
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
