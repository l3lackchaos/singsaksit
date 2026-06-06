'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { shipOrderAction, type ActionResult } from '@/modules/admin/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'กำลังบันทึก…' : 'บันทึกการจัดส่ง'}</Button>;
}

export function ShipForm({ orderId }: { orderId: string }) {
  const [state, action] = useActionState(shipOrderAction, {} as ActionResult);
  return (
    <form action={action} className="grid max-w-sm gap-3">
      <input type="hidden" name="orderId" value={orderId} />
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-success">{state.success}</p>}
      <div className="grid gap-2">
        <Label htmlFor="carrier">ขนส่ง</Label>
        <Input id="carrier" name="carrier" placeholder="เช่น Kerry, ไปรษณีย์ไทย" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tracking">เลขพัสดุ</Label>
        <Input id="tracking" name="tracking" required />
      </div>
      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
