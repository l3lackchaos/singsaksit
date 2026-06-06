import type { Metadata } from 'next';
import Link from 'next/link';
import { PackageOpen } from 'lucide-react';
import { listUserOrders } from '@/modules/orders/repository';
import { formatThb } from '@/lib/money';
import { Button } from '@/components/ui/button';
import { ORDER_STATUS_LABEL } from '@/modules/orders/labels';

export const metadata: Metadata = { title: 'คำสั่งซื้อของฉัน', robots: { index: false } };

export default async function OrdersPage() {
  const orders = await listUserOrders();

  if (orders.length === 0) {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center text-muted-foreground">
        <PackageOpen className="h-12 w-12" />
        <p>ยังไม่มีคำสั่งซื้อ</p>
        <Button asChild>
          <Link href="/products">เลือกชมพระเครื่อง</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-2xl font-bold tracking-tight">คำสั่งซื้อของฉัน</h1>
      <ul className="mt-6 divide-y rounded-lg border">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-between gap-4 p-4 hover:bg-muted/40"
            >
              <div>
                <p className="font-medium">#{order.orderNo}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString('th-TH')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold tabular-nums">{formatThb(order.total)}</p>
                <p className="text-sm text-muted-foreground">
                  {ORDER_STATUS_LABEL[order.status]}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
