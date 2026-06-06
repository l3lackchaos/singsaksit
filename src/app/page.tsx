import Link from 'next/link';
import { ShieldCheck, BadgeCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSetting } from '@/lib/settings';
import { loadSettings } from '@/modules/settings/load';
import { listPublishedBanners } from '@/modules/cms/repository';
import { env } from '@/lib/env';

export default async function HomePage() {
  await loadSettings();
  const storeName = getSetting('store.name');
  const banners = await listPublishedBanners();

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

      {/* Hero — centered + generous air (calm, sacred). Rhythm via varied gaps:
          tight badge→title, then a deliberate jump before the call to action. */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-secondary/60 to-background">
        <div className="container flex flex-col items-center py-[clamp(4.5rem,11vw,9rem)] text-center">
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

      {/* Trust band — a distinct muted band (rhythm contrast), columns split by
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
    </>
  );
}
