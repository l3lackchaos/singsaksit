import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatThb } from '@/lib/money';
import type { ProductListItem } from '../types';

export function StockBadge({
  product,
  showStock,
  lowStockBadge,
}: {
  product: Pick<ProductListItem, 'stock' | 'lowStockThreshold' | 'status'>;
  showStock: boolean;
  lowStockBadge: boolean;
}) {
  const soldOut = product.status === 'SOLD_OUT' || product.stock <= 0;

  if (soldOut) {
    return (
      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        หมดแล้ว
      </span>
    );
  }
  if (lowStockBadge && product.stock <= product.lowStockThreshold) {
    return (
      <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
        เหลือน้อย{showStock ? ` ${product.stock} ชิ้น` : ''}
      </span>
    );
  }
  if (showStock) {
    return (
      <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
        มี {product.stock} ชิ้น
      </span>
    );
  }
  return null;
}

export function ProductCard({
  product,
  showStock,
  lowStockBadge,
}: {
  product: ProductListItem;
  showStock: boolean;
  lowStockBadge: boolean;
}) {
  const soldOut = product.status === 'SOLD_OUT' || product.stock <= 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div
        className={cn(
          'relative aspect-square w-full bg-gradient-to-br from-secondary to-muted',
          soldOut && 'opacity-70',
        )}
        aria-hidden="true"
      >
        <span className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-primary/30">
          พระ
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-medium leading-snug group-hover:text-primary">
          {product.title}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="font-semibold tabular-nums">{formatThb(product.price)}</span>
          <StockBadge
            product={product}
            showStock={showStock}
            lowStockBadge={lowStockBadge}
          />
        </div>
      </div>
    </Link>
  );
}
