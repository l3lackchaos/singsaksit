import { notFound } from 'next/navigation';
import { getOrderDetail } from '@/modules/orders/repository';
import { OrderStatusTimeline } from '@/modules/orders/components/order-status-timeline';
import { ShipForm } from '@/modules/admin/components/ship-form';
import { RealtimeRefresh } from '@/components/realtime-refresh';
import { PAYMENT_STATUS_LABEL } from '@/modules/orders/labels';
import { formatThb } from '@/lib/money';

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderDetail(id);
  if (!order) notFound();

  const canShip = order.status === 'PAID' || order.status === 'PROCESSING';

  return (
    <div className="max-w-2xl">
      <RealtimeRefresh table="Order" channel={`admin-order-${id}`} />
      <h1 className="text-2xl font-bold tracking-tight">คำสั่งซื้อ #{order.orderNo}</h1>

      <section className="mt-6 rounded-lg border p-5">
        <h2 className="mb-4 font-semibold">สถานะ</h2>
        <OrderStatusTimeline status={order.status} />
        {order.payment && (
          <p className="mt-4 text-sm text-muted-foreground">
            การชำระเงิน: {PAYMENT_STATUS_LABEL[order.payment.status]} · {formatThb(order.payment.amount)}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-lg border p-5">
        <h2 className="mb-3 font-semibold">รายการ</h2>
        <ul className="space-y-1 text-sm">
          {order.items.map((it) => (
            <li key={it.id} className="flex justify-between">
              <span className="text-muted-foreground">{it.title} × {it.qty}</span>
              <span className="tabular-nums">{formatThb(it.price * it.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t pt-2 text-right font-semibold">ยอดสุทธิ {formatThb(order.total)}</p>
      </section>

      <section className="mt-6 rounded-lg border p-5">
        <h2 className="mb-3 font-semibold">จัดส่ง</h2>
        {order.shipment?.trackingNo ? (
          <p className="text-sm">
            จัดส่งแล้วผ่าน {order.shipment.carrier} — เลขพัสดุ{' '}
            <span className="font-medium">{order.shipment.trackingNo}</span>
          </p>
        ) : canShip ? (
          <ShipForm orderId={order.id} />
        ) : (
          <p className="text-sm text-muted-foreground">
            ต้องยืนยันการชำระเงินก่อนจึงจะบันทึกการจัดส่งได้
          </p>
        )}
      </section>
    </div>
  );
}
