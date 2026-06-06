'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/modules/cart/cart-store';
import { Button } from '@/components/ui/button';

export function CartNavButton() {
  const { count, hydrated } = useCart();
  return (
    <Button variant="ghost" size="icon" aria-label="ตะกร้าสินค้า" asChild>
      <Link href="/cart" className="relative">
        <ShoppingCart className="h-5 w-5" />
        {hydrated && count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {count}
          </span>
        )}
      </Link>
    </Button>
  );
}
