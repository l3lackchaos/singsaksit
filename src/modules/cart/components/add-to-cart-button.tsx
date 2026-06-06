'use client';

import * as React from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, type CartLine } from '../cart-store';

export function AddToCartButton({
  product,
  soldOut,
}: {
  product: Omit<CartLine, 'qty'>;
  soldOut: boolean;
}) {
  const { add } = useCart();
  const [added, setAdded] = React.useState(false);

  if (soldOut) {
    return (
      <Button size="lg" className="flex-1" disabled>
        สินค้าหมด
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      className="flex-1"
      onClick={() => {
        add(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
      }}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" /> เพิ่มลงตะกร้าแล้ว
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" /> เพิ่มลงตะกร้า
        </>
      )}
    </Button>
  );
}
