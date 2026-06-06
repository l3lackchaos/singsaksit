'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { upsertCmsPageAction, type ActionResult } from '@/modules/admin/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'กำลังบันทึก…' : 'บันทึกหน้า'}</Button>;
}

export function CmsPageForm({
  defaults = {},
}: {
  defaults?: { id?: string; title?: string; slug?: string; body?: string; published?: boolean };
}) {
  const [state, action] = useActionState(upsertCmsPageAction, {} as ActionResult);
  return (
    <form action={action} className="grid max-w-2xl gap-4">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-success">{state.success}</p>}
      <div className="grid gap-2">
        <Label htmlFor="title">หัวข้อ</Label>
        <Input id="title" name="title" defaultValue={defaults.title} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="slug">Slug (เว้นว่างเพื่อสร้างอัตโนมัติ)</Label>
        <Input id="slug" name="slug" defaultValue={defaults.slug} placeholder="about" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="body">เนื้อหา (HTML พื้นฐาน จะถูก sanitize)</Label>
        <textarea
          id="body"
          name="body"
          rows={10}
          defaultValue={defaults.body}
          className="rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={defaults.published} className="h-4 w-4" />
        เผยแพร่
      </label>
      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
