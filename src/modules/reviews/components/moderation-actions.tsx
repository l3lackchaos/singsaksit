'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { moderateReviewAction } from '../actions';

export function ModerationActions({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function act(approve: boolean) {
    startTransition(async () => {
      await moderateReviewAction(reviewId, approve);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => act(true)} disabled={pending}>
        <Check className="h-4 w-4" /> อนุมัติ
      </Button>
      <Button size="sm" variant="outline" onClick={() => act(false)} disabled={pending}>
        <X className="h-4 w-4" /> ปฏิเสธ
      </Button>
    </div>
  );
}
