import { AdminHelp, OrderPreview } from '@/modules/admin/components/admin-help';
import Link from 'next/link';
import { listAllOrders } from '@/modules/admin/repository';
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from '@/modules/orders/labels';
import { formatThb } from '@/lib/money';

export default async function AdminOrdersPage() {
  const orders = await listAllOrders();
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">คำสั่งซื้อทั้งหมด</h1>
      <div className="mt-6">
        <AdminHelp
          what="ดูคำสั่งซื้อทั้งหมด คลิกเข้าไปเพื่อบันทึกเลขพัสดุ (จัดส่ง) หรือคืนเงิน สถานะที่เปลี่ยนจะแจ้งลูกค้าแบบเรียลไทม์"
          preview={<OrderPreview />}
        />
      </div>
      <ul className="mt-6 divide-y rounded-lg border">
        {orders.map((o) => (
          <li key={o.id}>
            <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-4 p-4 hover:bg-muted/40">
              <div>
                <p className="font-medium">#{o.orderNo}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(o.createdAt).toLocaleString('th-TH')}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold tabular-nums">{formatThb(o.total)}</p>
                <p className="text-muted-foreground">
                  {ORDER_STATUS_LABEL[o.status]}
                  {o.paymentStatus ? ` · ${PAYMENT_STATUS_LABEL[o.paymentStatus]}` : ''}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
