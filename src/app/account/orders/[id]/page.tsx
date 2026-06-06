import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getOrderDetail } from '@/modules/orders/repository';
import { getUser } from '@/lib/auth';
import { loadSettings } from '@/modules/settings/load';
import { getSetting } from '@/lib/settings';
import { promptPayQrDataUrl } from '@/modules/payments/promptpay';
import { OrderStatusTimeline } from '@/modules/orders/components/order-status-timeline';
import { PaymentPanel } from '@/modules/orders/components/payment-panel';
import { RealtimeOrder } from '@/modules/orders/components/realtime-order';
import { formatThb } from '@/lib/money';

export const metadata: Metadata = { title: 'รายละเอียดคำสั่งซื้อ', robots: { index: false } };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, user] = await Promise.all([getOrderDetail(id), getUser()]);
  if (!order || !user) notFound();

  await loadSettings();
  const needsPayment =
    order.payment?.status === 'PENDING' || order.payment?.status === 'REJECTED';

  let qrDataUrl: string | null = null;
  const promptpayId = getSetting('payment.promptpayId');
  if (needsPayment && order.payment?.method === 'PROMPTPAY' && promptpayId) {
    qrDataUrl = await promptPayQrDataUrl(promptpayId, order.total);
  }

  return (
    <div className="container max-w-4xl py-10">
      <RealtimeOrder orderId={order.id} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight">คำสั่งซื้อ #{order.orderNo}</h1>
        <span className="text-sm text-muted-foreground">
          {new Date(order.createdAt).toLocaleString('th-TH')}
        </span>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <section className="rounded-lg border p-5">
            <h2 className="mb-4 font-semibold">สถานะคำสั่งซื้อ</h2>
            <OrderStatusTimeline status={order.status} />
            {order.shipment?.trackingNo && (
              <p className="mt-4 text-sm">
                ขนส่ง: {order.shipment.carrier} — เลขพัสดุ{' '}
                <span className="font-medium">{order.shipment.trackingNo}</span>
              </p>
            )}
          </section>

          {order.payment && (
            <section className="rounded-lg border p-5">
              <h2 className="mb-4 font-semibold">การชำระเงิน</h2>
              <PaymentPanel
                orderId={order.id}
                method={order.payment.method}
                amount={order.payment.amount}
                status={order.payment.status}
                rejectReason={order.payment.rejectReason}
                qrDataUrl={qrDataUrl}
                bankAccounts={getSetting('payment.bankAccounts')}
              />
            </section>
          )}

          <section className="rounded-lg border p-5">
            <h2 className="mb-4 font-semibold">ที่อยู่จัดส่ง</h2>
            <address className="text-sm not-italic text-muted-foreground">
              {order.shippingAddress.recipient} · {order.shippingAddress.phone}
              <br />
              {order.shippingAddress.line1} ต.{order.shippingAddress.subdistrict} อ.
              {order.shippingAddress.district} จ.{order.shippingAddress.province}{' '}
              {order.shippingAddress.postalCode}
            </address>
          </section>
        </div>

        <aside className="h-fit rounded-lg border bg-card p-6">
          <h2 className="font-semibold">รายการ</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-2">
                <span className="line-clamp-1 text-muted-foreground">
                  {item.title} × {item.qty}
                </span>
                <span className="tabular-nums">{formatThb(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 border-t pt-3 text-sm">
            <Row label="ยอดสินค้า" value={formatThb(order.subtotal)} />
            {order.discount > 0 && <Row label="ส่วนลด" value={`-${formatThb(order.discount)}`} />}
            <Row label="ค่าจัดส่ง" value={order.shippingFee === 0 ? 'ฟรี' : formatThb(order.shippingFee)} />
            <div className="flex justify-between border-t pt-2 font-semibold">
              <dt>ยอดสุทธิ</dt>
              <dd className="tabular-nums">{formatThb(order.total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
