import type { Metadata } from 'next';
import Link from 'next/link';
import { HeartOff } from 'lucide-react';
import { listWishlist } from '@/modules/wishlist/repository';
import { loadSettings } from '@/modules/settings/load';
import { getSetting } from '@/lib/settings';
import { ProductCard } from '@/modules/catalog/components/product-card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'รายการโปรด', robots: { index: false } };

export default async function WishlistPage() {
  await loadSettings();
  const items = await listWishlist();
  const showStock = getSetting('display.showStock');
  const lowStockBadge = getSetting('display.lowStockBadge');

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold tracking-tight">รายการโปรด</h1>

      {items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center text-muted-foreground">
          <HeartOff className="h-12 w-12" />
          <p>ยังไม่มีรายการโปรด</p>
          <Button asChild>
            <Link href="/products">เลือกชมพระเครื่อง</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showStock={showStock}
              lowStockBadge={lowStockBadge}
            />
          ))}
        </div>
      )}
    </div>
  );
}
