import { AdminHelp, ProductPreview } from '@/modules/admin/components/admin-help';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { listAllProducts } from '@/modules/admin/repository';
import { Button } from '@/components/ui/button';
import { formatThb } from '@/lib/money';

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'ฉบับร่าง',
  ACTIVE: 'เผยแพร่',
  SOLD_OUT: 'หมด',
  ARCHIVED: 'เก็บถาวร',
};

export default async function AdminProductsPage() {
  const products = await listAllProducts();
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">สินค้า</h1>
        <Button asChild size="sm">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" /> เพิ่มสินค้า
          </Link>
        </Button>
      </div>
      <div className="mt-6">
        <AdminHelp
          what="เพิ่มหรือแก้ไขสินค้า (ชื่อ ราคา สต็อก รูป สถานะ) เมื่อตั้งสถานะเป็นเผยแพร่ (ACTIVE) สินค้าจะแสดงในหน้าร้านและค้นหาได้ทันที และสต็อกจะถูกตัดอัตโนมัติเมื่อยืนยันการชำระเงิน"
          preview={<ProductPreview />}
        />
      </div>
      <ul className="mt-6 divide-y rounded-lg border">
        {products.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/products/${p.id}`} className="flex items-center justify-between gap-4 p-4 hover:bg-muted/40">
              <div className="min-w-0">
                <p className="line-clamp-1 font-medium">{p.title}</p>
                <p className="text-sm text-muted-foreground">/{p.slug}</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold tabular-nums">{formatThb(p.price)}</p>
                <p className="text-muted-foreground">
                  สต็อก {p.stock} · {STATUS_LABEL[p.status] ?? p.status}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {products.length === 0 && (
        <p className="mt-10 text-center text-muted-foreground">ยังไม่มีสินค้า</p>
      )}
    </div>
  );
}
