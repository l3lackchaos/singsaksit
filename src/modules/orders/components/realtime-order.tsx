'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * Subscribes to realtime changes for a single order (Order/Payment/Shipment rows)
 * and refreshes the server component tree when anything changes. RLS ensures the
 * client only receives rows it is allowed to see.
 */
export function RealtimeOrder({ orderId }: { orderId: string }) {
  const router = useRouter();

  React.useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Order', filter: `id=eq.${orderId}` },
        () => router.refresh(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Payment', filter: `orderId=eq.${orderId}` },
        () => router.refresh(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Shipment', filter: `orderId=eq.${orderId}` },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [orderId, router]);

  return null;
}
