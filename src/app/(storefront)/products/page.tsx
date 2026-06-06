import type { Metadata } from 'next';
import { PackageOpen } from 'lucide-react';
import {
  listActiveProducts,
  listCategories,
  type ProductSort,
} from '@/modules/catalog/repository';
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
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const { q, category, sort } = await searchParams;
  await loadSettings();
  const showStock = getSetting('display.showStock');
  const lowStockBadge = getSetting('display.lowStockBadge');

  const [products, categories] = await Promise.all([
    listActiveProducts({
      search: q,
      categorySlug: category,
      sort: (sort as ProductSort) || 'new',
    }),
    listCategories(),
  ]);

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold tracking-tight">พระเครื่องทั้งหมด</h1>

      <form className="mt-4 flex flex-wrap gap-2" role="search">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="ค้นหาพระเครื่อง…"
          className="h-10 min-w-[200px] flex-1 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="ค้นหา"
        />
        <select
          name="category"
          defaultValue={category ?? ''}
          aria-label="หมวดหมู่"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">ทุกหมวด</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={sort ?? 'new'}
          aria-label="เรียงลำดับ"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="new">ใหม่ล่าสุด</option>
          <option value="price_asc">ราคาต่ำ→สูง</option>
          <option value="price_desc">ราคาสูง→ต่ำ</option>
        </select>
        <button
          type="submit"
          className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          ค้นหา
        </button>
      </form>

      <p className="mt-3 text-sm text-muted-foreground">พบ {products.length} รายการ</p>

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
