'use client';

import * as React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toggleWishlistAction } from '../actions';

export function WishlistButton({
  productId,
  initialSaved = false,
}: {
  productId: string;
  initialSaved?: boolean;
}) {
  const [saved, setSaved] = React.useState(initialSaved);
  const [pending, startTransition] = React.useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-pressed={saved}
      aria-label={saved ? 'นำออกจากรายการโปรด' : 'บันทึกลงรายการโปรด'}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await toggleWishlistAction(productId);
          setSaved(result.saved);
        })
      }
    >
      <Heart className={cn('h-5 w-5', saved && 'fill-destructive text-destructive')} />
    </Button>
  );
}
