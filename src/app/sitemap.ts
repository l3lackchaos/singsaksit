import type { MetadataRoute } from 'next';
import { listActiveProductSlugs } from '@/modules/catalog/repository';
import { listPublishedPageSlugs } from '@/modules/cms/repository';
import { env } from '@/lib/env';

// Auto-generated from DB content (docs/SPEC.md §8). Never maintain a static URL list.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await listActiveProductSlugs();
    productRoutes = slugs.map((slug) => ({
      url: `${base}/product/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch {
    // If the DB is unreachable at build time, still emit the static routes.
  }

  let pageRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await listPublishedPageSlugs();
    pageRoutes = slugs.map((slug) => ({
      url: `${base}/pages/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    }));
  } catch {
    /* ignore */
  }

  return [...staticRoutes, ...productRoutes, ...pageRoutes];
}
