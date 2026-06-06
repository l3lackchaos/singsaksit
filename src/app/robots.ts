import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep private/transactional areas out of the index (docs/SPEC.md §4).
      disallow: ['/account', '/admin', '/cart', '/checkout'],
    },
    sitemap: `${env.siteUrl}/sitemap.xml`,
  };
}
