import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Only run on routes that actually require a session. Public/storefront pages
  // skip the middleware entirely — no per-request Supabase auth round-trip.
  matcher: ['/account/:path*', '/admin/:path*', '/checkout/:path*'],
};
