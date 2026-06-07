'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Copy, UploadCloud } from 'lucide-react';
import { uploadSlipAction, type SlipState } from '@/modules/orders/checkout-actions';
import { Button } from '@/components/ui/button';
import { formatThb } from '@/lib/money';
import type { PaymentMethod, PaymentStatus } from '@/lib/supabase/database.types';

interface BankAccount {
  bank: string;
  name: string;
  number: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="mt-3" disabled={pending}>
      <UploadCloud className="h-4 w-4" />
      {pending ? 'กำลังอัปโหลด…' : 'ส่งสลิปให้ตรวจสอบ'}
    </Button>
  );
}

export function PaymentPanel({
  orderId,
  method,
  amount,
  status,
  rejectReason,
  qrDataUrl,
  bankAccounts,
}: {
  orderId: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  rejectReason: string | null;
  qrDataUrl: string | null;
  bankAccounts: BankAccount[];
}) {
  const [state, action] = useActionState(uploadSlipAction, {} as SlipState);

  if (status === 'PAID') {
    return (
      <div className="rounded-md bg-success/10 px-4 py-3 text-sm font-medium text-success">
        ยืนยันการชำระเงินเรียบร้อยแล้ว ขอบคุณครับ 🙏
      </div>
    );
  }

  if (status === 'PENDING_REVIEW') {
    return (
      <div className="rounded-md bg-warning/10 px-4 py-3 text-sm font-medium text-warning-emphasis">
        ⏳ ได้รับสลิปแล้ว กำลังรอแอดมินตรวจสอบ · สถานะจะอัปเดตอัตโนมัติ
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {status === 'REJECTED' && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          สลิปก่อนหน้าไม่ผ่านการตรวจสอบ{rejectReason ? `: ${rejectReason}` : ''} · กรุณาอัปโหลดใหม่
        </div>
      )}

      {method === 'PROMPTPAY' ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">สแกนเพื่อชำระผ่าน PromptPay</p>
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="PromptPay QR" width={240} height={240} />
          ) : (
            <p className="text-sm text-destructive">ยังไม่ได้ตั้งค่า PromptPay</p>
          )}
          <p className="font-semibold tabular-nums">{formatThb(amount)}</p>
        </div>
      ) : (
        <div className="space-y-2 rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">โอนเงินมาที่บัญชี</p>
          {bankAccounts.length === 0 && (
            <p className="text-sm text-destructive">ยังไม่ได้ตั้งค่าบัญชีธนาคาร</p>
          )}
          {bankAccounts.map((acc) => (
            <div key={acc.number} className="flex items-center justify-between gap-2 text-sm">
              <span>
                <span className="font-medium">{acc.bank}</span> · {acc.name}
                <br />
                <span className="tabular-nums">{acc.number}</span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="คัดลอกเลขบัญชี"
                onClick={() => navigator.clipboard?.writeText(acc.number)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <p className="pt-2 font-semibold tabular-nums">ยอดโอน: {formatThb(amount)}</p>
        </div>
      )}

      <form action={action} className="rounded-lg border p-4">
        <input type="hidden" name="orderId" value={orderId} />
        <p className="text-sm font-medium">อัปโหลดสลิปการชำระเงิน</p>
        {state.error && <p className="mt-2 text-sm text-destructive">{state.error}</p>}
        <input
          type="file"
          name="slip"
          accept="image/*,application/pdf"
          required
          className="mt-3 block w-full text-sm file:mr-3 file:rounded-md file:border file:bg-secondary file:px-3 file:py-1.5 file:text-sm"
        />
        <SubmitButton />
      </form>
    </div>
  );
}
