'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { addAddressAction, type AddressState } from '../address-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'กำลังบันทึก…' : 'เพิ่มที่อยู่'}</Button>;
}

function Field({ name, label, type = 'text' }: { name: string; label: string; type?: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required />
    </div>
  );
}

export function AddressForm() {
  const [state, action] = useActionState(addAddressAction, {} as AddressState);
  return (
    <form action={action} className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
      {state.error && <p className="text-sm text-destructive sm:col-span-2">{state.error}</p>}
      {state.success && <p className="text-sm text-success sm:col-span-2">{state.success}</p>}
      <Field name="recipient" label="ชื่อผู้รับ" />
      <Field name="phone" label="เบอร์โทร" type="tel" />
      <div className="sm:col-span-2">
        <Field name="line1" label="ที่อยู่ (บ้านเลขที่ ถนน)" />
      </div>
      <Field name="subdistrict" label="ตำบล/แขวง" />
      <Field name="district" label="อำเภอ/เขต" />
      <Field name="province" label="จังหวัด" />
      <Field name="postalCode" label="รหัสไปรษณีย์" />
      <div className="sm:col-span-2">
        <SubmitButton />
      </div>
    </form>
  );
}
