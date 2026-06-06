'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { refundOrderAction } from '@/modules/admin/actions';
import { Button } from '@/components/ui/button';

export function RefundButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  return (
    <div className="space-y-1">
      <Button
        variant="destructive"
        size="sm"
        disabled={pending}
        onClick={() => {
          if (!window.confirm('ยืนยันการคืนเงินและคืนสต็อก?')) return;
          startTransition(async () => {
            const res = await refundOrderAction(orderId);
            if (res.error) setError(res.error);
            else router.refresh();
          });
        }}
      >
        คืนเงิน (Refund)
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
