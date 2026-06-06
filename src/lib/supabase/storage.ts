import { env } from '@/lib/env';

/** Public URL for an image stored in the `products` bucket. */
export function productImageUrl(path: string): string {
  return `${env.supabaseUrl}/storage/v1/object/public/products/${path}`;
}
