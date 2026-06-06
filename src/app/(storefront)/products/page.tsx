import type { Metadata } from 'next';
import { PackageOpen } from 'lucide-react';
import { listActiveProducts } from '@/modules/catalog/repository';
import { loadSettings } from '@/modules/settings/load';
import { getSetting } from '@/lib/settings';
import { ProductCard } from '@/modules/catalog/components/product-card';

export const metadata: Metadata = {
  title: 'พระเครื่องทั้งหมด',
  description: 'เลือกชมพระเครื่องคุณภาพ คัดสรรของแท้ พร้อมข้อมูลครบถ้วน',
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  await loadSettings();
  const showStock = getSetting('display.showStock');
  const lowStockBadge = getSetting('display.lowStockBadge');
  const products = await listActiveProducts({ search: q });

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold tracking-tight">พระเครื่องทั้งหมด</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {q ? `ผลการค้นหา “${q}” — ` : ''}
        พบ {products.length} รายการ
      </p>

      {products.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center text-muted-foreground">
          <PackageOpen className="h-12 w-12" />
          <p>ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
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
