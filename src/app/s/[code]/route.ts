import { NextResponse } from 'next/server';
import { createSupabasePublicClient } from '@/lib/supabase/public';

// Resolve a short link, count the click (via SECURITY DEFINER RPC), and 302 redirect.
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const sb = createSupabasePublicClient();
  const { data } = await sb.rpc('resolve_short_link', { p_code: code });

  if (typeof data === 'string' && data.length > 0) {
    return NextResponse.redirect(data, 302);
  }
  return NextResponse.redirect(new URL('/', request.url));
}
