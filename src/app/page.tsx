import Link from 'next/link';
import { ShieldCheck, BadgeCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSetting } from '@/lib/settings';

export default function HomePage() {
  const storeName = getSetting('store.name');

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-secondary/60 to-background">
        <div className="container flex flex-col items-center gap-6 py-20 text-center md:py-28">
          <span className="rounded-full border bg-background/60 px-4 py-1 text-sm text-muted-foreground">
            พระแท้ ตรวจสอบได้ ชำระเงินปลอดภัย
          </span>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            {storeName}
            <span className="block text-primary">ศูนย์รวมพระเครื่องมงคล</span>
          </h1>
          <p className="max-w-xl text-balance text-muted-foreground">
            คัดสรรพระเครื่องคุณภาพ พร้อมระบบยืนยันการชำระเงินโดยแอดมิน
            และติดตามสถานะคำสั่งซื้อแบบเรียลไทม์
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/products">เลือกชมพระเครื่อง</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">เกี่ยวกับเรา</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="container grid gap-6 py-12 md:grid-cols-3">
        {[
          { icon: BadgeCheck, title: 'พระแท้ คัดสรร', desc: 'ข้อมูลครบ รูปคมชัดทุกองค์' },
          {
            icon: ShieldCheck,
            title: 'ชำระเงินปลอดภัย',
            desc: 'PromptPay / โอนธนาคาร ยืนยันโดยแอดมิน',
          },
          { icon: Truck, title: 'ติดตามได้เรียลไทม์', desc: 'รู้สถานะตั้งแต่จ่ายจนถึงจัดส่ง' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-lg border bg-card p-6 text-card-foreground">
            <Icon className="h-8 w-8 text-primary" />
            <h2 className="mt-4 text-lg font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </section>
    </>
  );
}
