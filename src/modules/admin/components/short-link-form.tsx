'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createShortLinkAction, type ActionResult } from '@/modules/admin/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'กำลังสร้าง…' : 'สร้างลิงก์'}</Button>;
}

export function ShortLinkForm() {
  const [state, action] = useActionState(createShortLinkAction, {} as ActionResult);
  return (
    <form action={action} className="grid max-w-xl gap-3 rounded-lg border p-4">
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-success">{state.success}</p>}
      <div className="grid gap-2">
        <Label htmlFor="targetUrl">ลิงก์ปลายทาง</Label>
        <Input id="targetUrl" name="targetUrl" type="url" placeholder="https://…" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="code">โค้ด (เว้นว่างเพื่อสุ่ม)</Label>
        <Input id="code" name="code" placeholder="promo2026" />
      </div>
      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
