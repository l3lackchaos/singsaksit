'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toggleCouponAction } from '@/modules/admin/actions';

export function CouponToggle({ couponId, active }: { couponId: string; active: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  return (
    <Button
      size="sm"
      variant={active ? 'outline' : 'default'}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleCouponAction(couponId, !active);
          router.refresh();
        })
      }
    >
      {active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
    </Button>
  );
}
