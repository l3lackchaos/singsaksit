import { createSupabasePublicClient } from '@/lib/supabase/public';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface RatingSummary {
  avg: number;
  count: number;
}

export async function listApprovedReviews(productId: string): Promise<ReviewItem[]> {
  const sb = createSupabasePublicClient();
  const { data } = await sb
    .from('Review')
    .select('id,rating,comment,createdAt')
    .eq('productId', productId)
    .eq('status', 'APPROVED')
    .order('createdAt', { ascending: false });
  return (data ?? []) as ReviewItem[];
}

export async function getRatingSummary(productId: string): Promise<RatingSummary> {
  const sb = createSupabasePublicClient();
  const { data } = await sb
    .from('Review')
    .select('rating')
    .eq('productId', productId)
    .eq('status', 'APPROVED');
  const ratings = (data ?? []).map((r) => (r as { rating: number }).rating);
  if (ratings.length === 0) return { avg: 0, count: 0 };
  const avg = ratings.reduce((s, r) => s + r, 0) / ratings.length;
  return { avg: Math.round(avg * 10) / 10, count: ratings.length };
}

export interface PendingReview extends ReviewItem {
  productTitle: string;
}

export async function listPendingReviews(): Promise<PendingReview[]> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from('Review')
    .select('id,rating,comment,createdAt,Product(title)')
    .eq('status', 'PENDING')
    .order('createdAt', { ascending: true });
  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const product = Array.isArray(r.Product) ? r.Product[0] : r.Product;
    return {
      id: r.id as string,
      rating: r.rating as number,
      comment: r.comment as string,
      createdAt: r.createdAt as string,
      productTitle: (product as { title?: string })?.title ?? '-',
    };
  });
}
