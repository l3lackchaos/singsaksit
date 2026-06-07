import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <section className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      {/* Thai numerals ๔๐๔ — a quiet contemporary-Thai note that keeps the
          sacred/premium voice instead of a generic system 404. */}
      <p
        aria-hidden="true"
        className="font-display text-[clamp(5rem,18vw,11rem)] font-bold leading-none text-primary/15"
      >
        ๔๐๔
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold">ไม่พบหน้าที่คุณค้นหา</h1>
      <p className="measure mt-4 text-pretty leading-relaxed text-muted-foreground">
        หน้านี้อาจถูกย้าย ลบออกไปแล้ว หรือลิงก์อาจพิมพ์ไม่ครบ
        ลองกลับไปที่หน้าแรกหรือเลือกชมพระเครื่องทั้งหมดได้เลย
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" asChild>
          <Link href="/">
            <Home className="h-4 w-4" /> กลับหน้าแรก
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/products">
            <Search className="h-4 w-4" /> ดูพระเครื่องทั้งหมด
          </Link>
        </Button>
      </div>
    </section>
  );
}
