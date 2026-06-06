'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { confirmPaymentAction, rejectPaymentAction } from '@/modules/admin/actions';

export function PaymentReviewActions({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  function confirm() {
    setError(null);
    startTransition(async () => {
      const res = await confirmPaymentAction(orderId);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  function reject() {
    const reason = window.prompt('เหตุผลที่ปฏิเสธสลิป') ?? '';
    setError(null);
    startTransition(async () => {
      const res = await rejectPaymentAction(orderId, reason);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <Button size="sm" onClick={confirm} disabled={pending}>
          <Check className="h-4 w-4" /> ยืนยัน
        </Button>
        <Button size="sm" variant="outline" onClick={reject} disabled={pending}>
          <X className="h-4 w-4" /> ปฏิเสธ
        </Button>
      </div>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
