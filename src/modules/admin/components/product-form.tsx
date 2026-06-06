'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { upsertProductAction, type ActionResult } from '@/modules/admin/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProductDefaults {
  id?: string;
  title?: string;
  slug?: string;
  priceBaht?: number;
  stock?: number;
  status?: string;
  description?: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'กำลังบันทึก…' : 'บันทึกสินค้า'}</Button>;
}

export function ProductForm({ defaults = {} }: { defaults?: ProductDefaults }) {
  const [state, action] = useActionState(upsertProductAction, {} as ActionResult);
  return (
    <form action={action} className="grid max-w-xl gap-4">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">{state.success}</p>
      )}
      <div className="grid gap-2">
        <Label htmlFor="title">ชื่อสินค้า</Label>
        <Input id="title" name="title" defaultValue={defaults.title} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="slug">Slug (เว้นว่างเพื่อสร้างอัตโนมัติ)</Label>
        <Input id="slug" name="slug" defaultValue={defaults.slug} placeholder="auto" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="priceBaht">ราคา (บาท)</Label>
          <Input id="priceBaht" name="priceBaht" type="number" min={0} step="0.01" defaultValue={defaults.priceBaht} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="stock">สต็อก</Label>
          <Input id="stock" name="stock" type="number" min={0} defaultValue={defaults.stock ?? 0} required />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="status">สถานะ</Label>
        <select
          id="status"
          name="status"
          defaultValue={defaults.status ?? 'DRAFT'}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="DRAFT">ฉบับร่าง</option>
          <option value="ACTIVE">เผยแพร่</option>
          <option value="SOLD_OUT">หมด</option>
          <option value="ARCHIVED">เก็บถาวร</option>
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">รายละเอียด</Label>
        <textarea
          id="description"
          name="description"
          defaultValue={defaults.description}
          rows={5}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
