import { Check } from 'lucide-react';
import type { OrderStatus } from '@/lib/supabase/database.types';
import { cn } from '@/lib/utils';

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'PENDING_PAYMENT', label: 'รอชำระเงิน' },
  { key: 'AWAITING_CONFIRMATION', label: 'รอตรวจสอบสลิป' },
  { key: 'PAID', label: 'ยืนยันการชำระเงิน' },
  { key: 'SHIPPED', label: 'จัดส่งแล้ว' },
  { key: 'DELIVERED', label: 'จัดส่งสำเร็จ' },
];

const ORDER_RANK: Record<OrderStatus, number> = {
  PENDING_PAYMENT: 0,
  AWAITING_CONFIRMATION: 1,
  PAID: 2,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: -1,
  REFUNDED: -1,
};

export function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  if (status === 'CANCELLED' || status === 'REFUNDED') {
    return (
      <div className="rounded-md bg-muted px-4 py-3 text-sm font-medium text-muted-foreground">
        {status === 'CANCELLED' ? 'คำสั่งซื้อถูกยกเลิก' : 'คำสั่งซื้อนี้ได้รับการคืนเงินแล้ว'}
      </div>
    );
  }

  const current = ORDER_RANK[status];

  return (
    <ol className="space-y-3">
      {STEPS.map((step, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          <li key={step.key} className="flex items-center gap-3">
            <span
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full border text-xs',
                done
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground',
              )}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={cn('text-sm', active ? 'font-semibold' : 'text-muted-foreground')}>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
