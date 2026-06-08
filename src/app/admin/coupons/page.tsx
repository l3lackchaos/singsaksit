import { AdminHelp, CouponPreview } from '@/modules/admin/components/admin-help';
import { listCoupons } from '@/modules/admin/repository';
import { CouponForm } from '@/modules/admin/components/coupon-form';
import { CouponToggle } from '@/modules/admin/components/coupon-toggle';
import { formatThb } from '@/lib/money';

const TYPE_LABEL: Record<string, string> = {
  PERCENT: 'เปอร์เซ็นต์',
  FIXED: 'จำนวนเงิน',
  FREE_SHIPPING: 'ส่งฟรี',
};

export default async function AdminCouponsPage() {
  const coupons = await listCoupons();
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">คูปองส่วนลด</h1>
      <div className="mt-6">
        <AdminHelp
          what="สร้างโค้ดส่วนลด (เปอร์เซ็นต์ / จำนวนเงิน / ส่งฟรี) พร้อมกำหนดลิมิตการใช้ ลูกค้านำโค้ดไปกรอกตอนชำระเงินเพื่อรับส่วนลด เปิด/ปิดโค้ดได้ทุกเมื่อ"
          preview={<CouponPreview />}
        />
      </div>
      <CouponForm />
      <ul className="divide-y rounded-lg border">
        {coupons.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium">{c.code}</p>
              <p className="text-sm text-muted-foreground">
                {TYPE_LABEL[c.type] ?? c.type} ·{' '}
                {c.type === 'PERCENT'
                  ? `${c.value}%`
                  : c.type === 'FIXED'
                    ? formatThb(c.value)
                    : '—'}{' '}
                · ใช้ไป {c.usedCount} ครั้ง · {c.active ? 'ใช้งานได้' : 'ปิดอยู่'}
              </p>
            </div>
            <CouponToggle couponId={c.id} active={c.active} />
          </li>
        ))}
        {coupons.length === 0 && <li className="p-4 text-sm text-muted-foreground">ยังไม่มีคูปอง</li>}
      </ul>
    </div>
  );
}
