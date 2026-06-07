import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSetting } from '@/lib/settings';
import { loadSettings } from '@/modules/settings/load';
import { listActiveProducts } from '@/modules/catalog/repository';
import { ProductCard } from '@/modules/catalog/components/product-card';
import { productImageUrl } from '@/lib/supabase/storage';
import { formatThb } from '@/lib/money';

export const metadata: Metadata = {
  title: 'เกี่ยวกับเรา',
  description:
    'ศูนย์รวมพระเครื่องแท้ คัดสรรพร้อมข้อมูลครบทุกองค์ ชำระเงินผ่านการยืนยันสลิปโดยแอดมิน และติดตามสถานะแบบเรียลไทม์',
};

// Real ordered flow — numbers carry meaning here (it IS a sequence), so they
// earn their place rather than acting as decorative section scaffolding.
const FLOW = [
  {
    title: 'เลือกพระที่ต้องการ',
    desc: 'เลือกองค์ที่ถูกใจจากข้อมูลครบถ้วน ทั้งวัด รุ่น ปี และเนื้อพระ พร้อมรูปคมชัดทุกมุม',
  },
  {
    title: 'ชำระเงินแล้วแนบสลิป',
    desc: 'โอนผ่าน PromptPay หรือบัญชีธนาคาร แล้วอัปโหลดสลิปเข้าระบบได้ทันทีหลังสั่งซื้อ',
  },
  {
    title: 'แอดมินตรวจสอบและยืนยัน',
    desc: 'ทีมงานตรวจสลิปจริงทุกใบก่อนยืนยันคำสั่งซื้อ ไม่มีระบบอัตโนมัติตัดสินแทนคน',
  },
  {
    title: 'ติดตามจนถึงมือ',
    desc: 'สถานะการชำระเงินและการจัดส่งอัปเดตแบบเรียลไทม์ รู้ทุกความเคลื่อนไหวจนพระถึงมือคุณ',
  },
];

const COMMITMENTS = [
  {
    label: 'คัดสรร',
    title: 'พระแท้ ข้อมูลครบทุกองค์',
    desc: 'ทุกองค์ผ่านการคัดเลือกและบันทึกข้อมูลละเอียด วัด รุ่น ปีที่สร้าง และเนื้อพระ พร้อมรูปความละเอียดสูงให้พิจารณาก่อนตัดสินใจ',
  },
  {
    label: 'โปร่งใส',
    title: 'ชำระเงินที่ตรวจสอบได้',
    desc: 'ไม่มีบัตรเครดิตหรือคนกลางที่มองไม่เห็น คุณโอนตรง แนบสลิป และแอดมินยืนยันด้วยมือ ทุกขั้นตอนมีหลักฐานและบันทึกไว้',
  },
  {
    label: 'ดูแล',
    title: 'อยู่กับคุณตลอดเส้นทาง',
    desc: 'ตั้งแต่กดสั่งซื้อจนพระถึงมือ คุณเห็นสถานะตามจริงตลอดเวลา หากมีข้อสงสัยติดต่อทีมงานได้โดยตรง',
  },
];

export default async function AboutPage() {
  await loadSettings();
  const storeName = getSetting('store.name');
  const showStock = getSetting('display.showStock');
  const lowStockBadge = getSetting('display.lowStockBadge');
  const products = await listActiveProducts({ sort: 'new' });
  // Lead with a real piece if one exists; images appear automatically once an
  // admin uploads them, and fall back to the gradient placeholder until then.
  const hero = products[0] ?? null;
  const showcase = products.slice(1, 5);

  return (
    <>
      {/* Opening statement · asymmetric, a single real piece carries the imagery
          so the page leads with an actual amulet, not a colored block. */}
      <section className="border-b">
        <div className="container grid items-center gap-10 py-[clamp(3.5rem,8vw,7rem)] lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="reveal">
            <p className="font-medium text-primary">{storeName}</p>
            <h1 className="mt-3 font-display text-[clamp(2.25rem,5vw,3.75rem)] font-bold leading-[1.1]">
              ให้เกียรติทุกองค์
              <span className="block text-primary">ด้วยความน่าเชื่อถือ</span>
            </h1>
            <p className="measure mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
              เราเชื่อว่าการเช่าบูชาพระเครื่องควรเริ่มจากความสบายใจ ร้านของเราจึงคัดสรรพระแท้
              บันทึกข้อมูลให้ครบ และวางระบบชำระเงินที่ตรวจสอบได้จริงทุกขั้นตอน
              เพื่อให้ทุกการตัดสินใจของคุณตั้งอยู่บนความมั่นใจ
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/products">
                  เลือกชมพระเครื่อง <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/products?sort=new">ดูพระมาใหม่</Link>
              </Button>
            </div>
          </div>

          {hero ? (
            <Link
              href={`/product/${hero.slug}`}
              className="group relative mx-auto block w-full max-w-md focus-visible:outline-none"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border bg-gradient-to-br from-secondary to-muted shadow-sm ring-1 ring-border/50">
                {hero.imagePath ? (
                  <Image
                    src={productImageUrl(hero.imagePath)}
                    alt={hero.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 90vw, 40vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center font-display text-7xl font-bold text-primary/25"
                  >
                    พระ
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                  <p className="font-display text-lg font-semibold text-white">{hero.title}</p>
                  <p className="mt-1 text-sm font-medium text-footer-accent">
                    {formatThb(hero.price)}
                  </p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="relative mx-auto flex aspect-[4/5] w-full max-w-md items-center justify-center overflow-hidden rounded-2xl border bg-gradient-to-br from-secondary to-muted font-display text-7xl font-bold text-primary/25">
              พระ
            </div>
          )}
        </div>
      </section>

      {/* Commitments · prose, not an icon-card grid (the home page already owns
          that pattern). Sticky heading + stacked statements divided by hairlines. */}
      <section className="border-b bg-muted/30">
        <div className="container grid gap-10 py-[clamp(3.5rem,7vw,6rem)] lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="font-display text-3xl font-bold">สิ่งที่เรายึดถือ</h2>
            <p className="mt-4 max-w-sm text-muted-foreground">
              หลักสามข้อที่กำหนดทุกการตัดสินใจของร้าน ตั้งแต่การคัดพระจนถึงการดูแลหลังเช่าบูชา
            </p>
          </div>
          <dl className="divide-y divide-border">
            {COMMITMENTS.map((c) => (
              <div key={c.label} className="py-7 first:pt-0 last:pb-0">
                <dt>
                  <span className="text-sm font-medium uppercase tracking-wide text-primary">
                    {c.label}
                  </span>
                  <p className="mt-1 font-display text-xl font-semibold text-foreground">
                    {c.title}
                  </p>
                </dt>
                <dd className="measure mt-2 leading-relaxed text-muted-foreground">{c.desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Admin-Confirm flow · a genuine 4-step sequence, so the numerals inform
          rather than decorate. Connecting line on desktop. */}
      <section className="border-b">
        <div className="container py-[clamp(3.5rem,7vw,6rem)]">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold">เช่าบูชาอย่างไร</h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              หัวใจของร้านคือการชำระเงินแบบยืนยันด้วยคน ไม่ใช่ระบบตัดบัตรอัตโนมัติ
              ทุกคำสั่งซื้อจึงมีคนตรวจสอบจริงก่อนเดินหน้า
            </p>
          </div>
          <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {FLOW.map((step, i) => (
              <li key={step.title} className="relative">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 font-display text-xl font-bold text-primary">
                    {i + 1}
                  </span>
                  {/* connecting line between steps (desktop only) */}
                  {i < FLOW.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="hidden h-px flex-1 bg-border lg:block"
                    />
                  )}
                </div>
                <p className="mt-4 font-display text-lg font-semibold">{step.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Showcase · real pieces from the catalog double as evidence and a soft CTA. */}
      {showcase.length > 0 && (
        <section className="border-b bg-muted/30">
          <div className="container py-[clamp(3.5rem,7vw,6rem)]">
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 className="font-display text-3xl font-bold">จากคลังของเรา</h2>
              <Link
                href="/products"
                className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                ดูทั้งหมด <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="stagger grid grid-cols-2 gap-4 lg:grid-cols-4">
              {showcase.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  showStock={showStock}
                  lowStockBadge={lowStockBadge}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Closing · deep brand band, calm invitation rather than a hard sell. */}
      <section className="bg-footer text-footer-foreground">
        <div className="container flex flex-col items-center gap-6 py-[clamp(3.5rem,7vw,6rem)] text-center">
          <h2 className="max-w-2xl font-display text-[clamp(1.75rem,4vw,2.75rem)] font-bold text-footer-accent">
            พร้อมหาพระองค์ที่ใช่แล้วหรือยัง
          </h2>
          <p className="max-w-xl text-footer-foreground/75">
            เลือกชมพระเครื่องที่คัดสรรมาแล้ว พร้อมข้อมูลครบและการดูแลตลอดการเช่าบูชา
          </p>
          <Button size="lg" asChild>
            <Link href="/products">
              เลือกชมพระเครื่อง <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
