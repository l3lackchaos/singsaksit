import { createSupabaseServerClient } from '@/lib/supabase/server';
import { listReviewQueue } from '@/modules/admin/repository';
import { PaymentReviewActions } from '@/modules/admin/components/payment-review-actions';
import { RealtimeRefresh } from '@/components/realtime-refresh';
import { formatThb } from '@/lib/money';

export default async function AdminPaymentsPage() {
  const queue = await listReviewQueue();
  const sb = await createSupabaseServerClient();

  const withSlips = await Promise.all(
    queue.map(async (item) => {
      let slipUrl: string | null = null;
      if (item.slipPath) {
        const { data } = await sb.storage.from('slips').createSignedUrl(item.slipPath, 300);
        slipUrl = data?.signedUrl ?? null;
      }
      return { ...item, slipUrl };
    }),
  );

  return (
    <div>
      <RealtimeRefresh table="Payment" channel="admin-payments" />
      <h1 className="text-2xl font-bold tracking-tight">ตรวจสอบสลิป</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        รายการที่รอการยืนยัน ({withSlips.length})
      </p>

      {withSlips.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">ไม่มีสลิปที่รอตรวจสอบ 🎉</p>
      ) : (
        <ul className="mt-6 divide-y rounded-lg border">
          {withSlips.map((item) => (
            <li key={item.orderId} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium">#{item.orderNo}</p>
                <p className="text-sm text-muted-foreground">
                  {item.buyer} · {item.method === 'PROMPTPAY' ? 'PromptPay' : 'โอนธนาคาร'} ·{' '}
                  {formatThb(item.amount)}
                </p>
                {item.slipUrl && (
                  <a
                    href={item.slipUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary underline"
                  >
                    ดูสลิป
                  </a>
                )}
              </div>
              <PaymentReviewActions orderId={item.orderId} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
