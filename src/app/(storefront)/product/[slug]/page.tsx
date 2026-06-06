import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { getProductBySlug } from '@/modules/catalog/repository';
import { loadSettings } from '@/modules/settings/load';
import { getSetting } from '@/lib/settings';
import { StockBadge } from '@/modules/catalog/components/product-card';
import { WishlistButton } from '@/modules/wishlist/components/wishlist-button';
import { isInWishlist } from '@/modules/wishlist/repository';
import { AddToCartButton } from '@/modules/cart/components/add-to-cart-button';
import { formatThb, satangToBaht } from '@/lib/money';
import { env } from '@/lib/env';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'ไม่พบสินค้า' };
  return {
    title: product.seoTitle ?? product.title,
    description: product.seoDescription ?? product.description.slice(0, 160),
    openGraph: { title: product.title, description: product.seoDescription ?? undefined },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  await loadSettings();
  const showStock = getSetting('display.showStock');
  const lowStockBadge = getSetting('display.lowStockBadge');
  const soldOut = product.status === 'SOLD_OUT' || product.stock <= 0;
  const saved = await isInWishlist(product.id);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    category: product.categoryName ?? undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'THB',
      price: satangToBaht(product.price).toFixed(2),
      availability: soldOut
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      url: `${env.siteUrl}/product/${product.slug}`,
    },
  };

  return (
    <div className="container py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav
        aria-label="เส้นทางนำทาง"
        className="flex items-center gap-1 text-sm text-muted-foreground"
      >
        <Link href="/" className="hover:text-primary">
          หน้าแรก
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/products" className="hover:text-primary">
          พระเครื่อง
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div
          className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-secondary to-muted"
          aria-hidden="true"
        >
          <span className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-primary/30">
            พระ
          </span>
        </div>

        <div>
          {product.categoryName && (
            <p className="text-sm text-muted-foreground">{product.categoryName}</p>
          )}
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{product.title}</h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-bold tabular-nums text-primary">
              {formatThb(product.price)}
            </span>
            <StockBadge
              product={product}
              showStock={showStock}
              lowStockBadge={lowStockBadge}
            />
          </div>

          {product.description && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
              {Object.entries(product.attributes).map(([key, value]) => (
                <div key={key} className="contents">
                  <dt className="text-muted-foreground">{key}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-6 flex gap-3">
            <AddToCartButton
              product={{
                productId: product.id,
                slug: product.slug,
                title: product.title,
                price: product.price,
                maxStock: product.stock,
              }}
              soldOut={soldOut}
            />
            <WishlistButton productId={product.id} initialSaved={saved} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            ชำระเงินผ่าน PromptPay / โอนธนาคาร แล้วอัปโหลดสลิปให้แอดมินตรวจสอบ
          </p>
        </div>
      </div>
    </div>
  );
}
