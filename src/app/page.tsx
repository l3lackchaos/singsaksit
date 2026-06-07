import Link from 'next/link';
import { ShieldCheck, BadgeCheck, Truck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSetting } from '@/lib/settings';
import { loadSettings } from '@/modules/settings/load';
import { listPublishedBanners } from '@/modules/cms/repository';
import { listActiveProducts } from '@/modules/catalog/repository';
import { ProductCard } from '@/modules/catalog/components/product-card';
import { FeaturedCarousel } from '@/modules/catalog/components/featured-carousel';
import { env } from '@/lib/env';

export default async function HomePage() {
  await loadSettings();
  const storeName = getSetting('store.name');
  const showStock = getSetting('display.showStock');
  const lowStockBadge = getSetting('display.lowStockBadge');
  const [banners, products] = await Promise.all([
    listPublishedBanners(),
    listActiveProducts({ sort: 'new' }),
  ]);

  // Prefer products with imagery in the carousel; fall back to the latest few.
  const withImages = products.filter((p) => p.imagePath);
  const featured = (withImages.length > 0 ? withImages : products).slice(0, 5);
  const latest = products.slice(0, 8);

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: storeName,
    url: env.siteUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      {banners.length > 0 && (
        <div className="border-b bg-primary text-primary-foreground">
          <div className="container flex flex-wrap items-center justify-center gap-x-2 py-2 text-sm">
            {banners.map((b) => (
              <span key={b.id}>
                {b.href ? (
                  <Link href={b.href} className="font-medium underline-offset-2 hover:underline">
                    {b.title} {b.body}
                  </Link>
                ) : (
                  <>
                    <span className="font-medium">{b.title}</span> {b.body}
                  </>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Hero · centered + generous air (calm, sacred). Rhythm via varied gaps:
          tight badge→title, then a deliberate jump before the call to action. */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-secondary/60 to-background">
        <div className="reveal container flex flex-col items-center py-[clamp(4.5rem,11vw,9rem)] text-center">
          <span className="rounded-full border bg-background/60 px-4 py-1 text-sm text-muted-foreground">
            พระแท้ ตรวจสอบได้ ชำระเงินปลอดภัย
          </span>
          <h1 className="text-hero mt-6 max-w-3xl font-bold">
            {storeName}
            <span className="mt-1 block text-primary">ศูนย์รวมพระเครื่องมงคล</span>
          </h1>
          <p className="mt-5 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            คัดสรรพระเครื่องคุณภาพ พร้อมระบบยืนยันการชำระเงินโดยแอดมิน
            และติดตามสถานะคำสั่งซื้อแบบเรียลไทม์
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/products">เลือกชมพระเครื่อง</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">เกี่ยวกับเรา</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured carousel · large swipeable spotlight for hand-picked pieces. */}
      {featured.length > 0 && (
        <section className="border-b">
          <div className="container py-12 md:py-16">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">พระเครื่องแนะนำ</h2>
              <Link
                href="/products"
                className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                ดูทั้งหมด <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <FeaturedCarousel products={featured} />
          </div>
        </section>
      )}

      {/* Trust band · a distinct muted band (rhythm contrast), columns split by
          hairline dividers rather than repeated boxes. */}
      <section className="border-b bg-muted/30">
        <div className="container grid divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            { icon: BadgeCheck, title: 'พระแท้ คัดสรร', desc: 'ข้อมูลครบ รูปคมชัดทุกองค์' },
            {
              icon: ShieldCheck,
              title: 'ชำระเงินปลอดภัย',
              desc: 'PromptPay / โอนธนาคาร ยืนยันโดยแอดมิน',
            },
            { icon: Truck, title: 'ติดตามได้เรียลไทม์', desc: 'รู้สถานะตั้งแต่จ่ายจนถึงจัดส่ง' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4 py-8 md:px-8">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New arrivals · the product list grid. */}
      {latest.length > 0 && (
        <section className="container py-12 md:py-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">พระเครื่องมาใหม่</h2>
            <Link
              href="/products"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              ดูทั้งหมด <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="stagger grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {latest.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showStock={showStock}
                lowStockBadge={lowStockBadge}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
