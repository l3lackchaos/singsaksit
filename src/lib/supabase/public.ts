import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

/**
 * Cookieless Supabase client for public, build-safe reads (catalog, settings, sitemap).
 * Uses the anon key under RLS — only data with a public SELECT policy is returned.
 * Does not carry a user session; use the server client (cookies) for owner-scoped reads.
 */
export function createSupabasePublicClient() {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
