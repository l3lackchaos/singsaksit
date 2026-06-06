'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

/** Refreshes the route whenever rows in the given table change (RLS-scoped). */
export function RealtimeRefresh({ table, channel }: { table: string; channel: string }) {
  const router = useRouter();
  React.useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const ch = supabase
      .channel(channel)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => router.refresh())
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [table, channel, router]);
  return null;
}
