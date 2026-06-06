'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createBannerAction, type ActionResult } from '@/modules/admin/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'กำลังบันทึก…' : 'เพิ่มแบนเนอร์'}</Button>;
}

export function BannerForm() {
  const [state, action] = useActionState(createBannerAction, {} as ActionResult);
  return (
    <form action={action} className="grid max-w-xl gap-3 rounded-lg border p-4">
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-success">{state.success}</p>}
      <div className="grid gap-2">
        <Label htmlFor="title">หัวข้อ</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="body">ข้อความ</Label>
        <Input id="body" name="body" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="href">ลิงก์ (ถ้ามี)</Label>
        <Input id="href" name="href" placeholder="/products" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked className="h-4 w-4" />
        เผยแพร่
      </label>
      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
