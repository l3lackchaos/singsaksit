import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-bold">ไม่พบสินค้า</h1>
      <p className="text-muted-foreground">
        ขออภัย ไม่พบพระเครื่องที่คุณกำลังค้นหา อาจถูกขายไปแล้วหรือนำออกจากระบบ
      </p>
      <Button asChild>
        <Link href="/products">ดูพระเครื่องทั้งหมด</Link>
      </Button>
    </div>
  );
}
