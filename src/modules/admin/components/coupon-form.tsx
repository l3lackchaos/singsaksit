'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createCouponAction, type ActionResult } from '@/modules/admin/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'กำลังสร้าง…' : 'สร้างคูปอง'}</Button>;
}

export function CouponForm() {
  const [state, action] = useActionState(createCouponAction, {} as ActionResult);
  return (
    <form action={action} className="grid max-w-xl gap-3 rounded-lg border p-4">
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-success">{state.success}</p>}
      <div className="grid gap-2">
        <Label htmlFor="code">โค้ด</Label>
        <Input id="code" name="code" placeholder="WELCOME10" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="type">ประเภท</Label>
          <select id="type" name="type" className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="PERCENT">เปอร์เซ็นต์ (%)</option>
            <option value="FIXED">จำนวนเงิน (บาท)</option>
            <option value="FREE_SHIPPING">ส่งฟรี</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="value">ค่า (% หรือ บาท)</Label>
          <Input id="value" name="value" type="number" min={0} defaultValue={0} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="minTotalBaht">ยอดขั้นต่ำ (บาท)</Label>
        <Input id="minTotalBaht" name="minTotalBaht" type="number" min={0} defaultValue={0} />
      </div>
      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
