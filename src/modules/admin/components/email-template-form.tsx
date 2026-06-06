'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateEmailTemplateAction, type ActionResult } from '@/modules/admin/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'กำลังบันทึก…' : 'บันทึกเทมเพลต'}</Button>;
}

export function EmailTemplateForm({
  id,
  subject,
  body,
}: {
  id: string;
  subject: string;
  body: string;
}) {
  const [state, action] = useActionState(updateEmailTemplateAction, {} as ActionResult);
  return (
    <form action={action} className="grid max-w-2xl gap-4">
      <input type="hidden" name="id" value={id} />
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-success">{state.success}</p>}
      <div className="grid gap-2">
        <Label htmlFor="subject">หัวข้ออีเมล</Label>
        <Input id="subject" name="subject" defaultValue={subject} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="body">เนื้อหา (HTML, ใช้ตัวแปร {`{{orderNo}}`} ฯลฯ)</Label>
        <textarea
          id="body"
          name="body"
          rows={10}
          defaultValue={body}
          className="rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
        />
      </div>
      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
