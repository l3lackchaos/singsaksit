'use client';

import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/modules/cart/cart-store';
import { Button } from '@/components/ui/button';
import { formatThb } from '@/lib/money';

export default function CartPage() {
  const { items, subtotal, setQty, remove, hydrated } = useCart();

  if (hydrated && items.length === 0) {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-xl font-bold">ตะกร้าว่างเปล่า</h1>
        <p className="text-muted-foreground">ยังไม่มีพระเครื่องในตะกร้าของคุณ</p>
        <Button asChild>
          <Link href="/products">เลือกชมพระเครื่อง</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold tracking-tight">ตะกร้าสินค้า</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y rounded-lg border">
          {items.map((item) => (
            <li key={item.productId} className="flex flex-wrap items-center gap-4 p-4">
              <div
                className="h-16 w-16 shrink-0 rounded-md bg-gradient-to-br from-secondary to-muted"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/product/${item.slug}`}
                  className="line-clamp-1 font-medium hover:text-primary"
                >
                  {item.title}
                </Link>
                <p className="text-sm text-muted-foreground">{formatThb(item.price)}</p>
              </div>
              {/* Controls cluster: wraps to its own line on narrow screens. */}
              <div className="ml-auto flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    aria-label="ลดจำนวน"
                    onClick={() => setQty(item.productId, item.qty - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center tabular-nums">{item.qty}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    aria-label="เพิ่มจำนวน"
                    disabled={item.qty >= item.maxStock}
                    onClick={() => setQty(item.productId, item.qty + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="w-24 text-right font-semibold tabular-nums">
                  {formatThb(item.price * item.qty)}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="ลบออกจากตะกร้า"
                  onClick={() => remove(item.productId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-lg border bg-card p-6">
          <h2 className="font-semibold">สรุปคำสั่งซื้อ</h2>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-muted-foreground">ยอดรวมสินค้า</span>
            <span className="font-medium tabular-nums">{formatThb(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            ค่าจัดส่งและส่วนลดคำนวณในขั้นตอนชำระเงิน
          </p>
          <Button asChild className="mt-6 w-full" size="lg">
            <Link href="/checkout">ดำเนินการชำระเงิน</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
