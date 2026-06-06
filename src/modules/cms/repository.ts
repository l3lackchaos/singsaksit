import { createSupabasePublicClient } from '@/lib/supabase/public';

export interface PublishedPage {
  slug: string;
  title: string;
  body: string;
  updatedAt: string;
}

export interface BannerItem {
  id: string;
  title: string;
  body: string;
  href: string | null;
}

export async function getPublishedPage(slug: string): Promise<PublishedPage | null> {
  const sb = createSupabasePublicClient();
  const { data } = await sb
    .from('CmsPage')
    .select('slug,title,body,updatedAt')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();
  return (data as PublishedPage | null) ?? null;
}

export async function listPublishedPageSlugs(): Promise<string[]> {
  const sb = createSupabasePublicClient();
  const { data } = await sb.from('CmsPage').select('slug').eq('published', true);
  return (data ?? []).map((r) => (r as { slug: string }).slug);
}

export async function listPublishedBanners(): Promise<BannerItem[]> {
  const sb = createSupabasePublicClient();
  const { data } = await sb
    .from('Banner')
    .select('id,title,body,href')
    .eq('published', true)
    .order('sortOrder', { ascending: true });
  return (data ?? []) as BannerItem[];
}
