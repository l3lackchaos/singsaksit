'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfileAction, type ProfileState } from '../actions';

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'กำลังบันทึก…' : 'บันทึก'}
    </Button>
  );
}

export function ProfileForm({
  defaultName,
  defaultPhone,
  email,
}: {
  defaultName: string;
  defaultPhone: string;
  email: string;
}) {
  const [state, action] = useActionState(updateProfileAction, {} as ProfileState);

  return (
    <form action={action} className="grid max-w-md gap-4">
      {state.error && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
          {state.success}
        </p>
      )}
      <div className="grid gap-2">
        <Label htmlFor="email">อีเมล</Label>
        <Input id="email" type="email" value={email} disabled />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="name">ชื่อ</Label>
        <Input id="name" name="name" defaultValue={defaultName} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">เบอร์โทร</Label>
        <Input id="phone" name="phone" type="tel" defaultValue={defaultPhone} />
      </div>
      <div>
        <SaveButton />
      </div>
    </form>
  );
}
