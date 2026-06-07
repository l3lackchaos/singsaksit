'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateSettingsAction, type ActionResult } from '@/modules/admin/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4" />
      {label}
    </label>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'กำลังบันทึก…' : 'บันทึกการตั้งค่า'}</Button>;
}

export function SettingsForm({ settings }: { settings: Record<string, unknown> }) {
  const [state, action] = useActionState(updateSettingsAction, {} as ActionResult);
  const bool = (k: string, d = false) => (typeof settings[k] === 'boolean' ? (settings[k] as boolean) : d);
  const str = (k: string, d = '') => (typeof settings[k] === 'string' ? (settings[k] as string) : d);
  const shippingBaht =
    typeof settings['shipping.fee'] === 'number' ? (settings['shipping.fee'] as number) / 100 : 50;

  return (
    <form action={action} className="grid max-w-xl gap-5">
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-success">{state.success}</p>}

      <div className="grid gap-2">
        <Label htmlFor="store.name">ชื่อร้าน</Label>
        <Input id="store.name" name="store.name" defaultValue={str('store.name', 'สิ่งศักดิ์สิทธิ์')} />
      </div>

      <fieldset className="grid gap-4 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">ช่องทางติดต่อ</legend>
        <div className="grid gap-2">
          <Label htmlFor="contact.email">อีเมลติดต่อ (รับข้อความจากแบบฟอร์มติดต่อ)</Label>
          <Input
            id="contact.email"
            name="contact.email"
            type="email"
            defaultValue={str('contact.email')}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contact.phone">เบอร์โทรศัพท์</Label>
          <Input id="contact.phone" name="contact.phone" defaultValue={str('contact.phone')} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contact.lineId">LINE ID</Label>
          <Input id="contact.lineId" name="contact.lineId" defaultValue={str('contact.lineId')} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contact.facebookUrl">ลิงก์ Facebook</Label>
          <Input
            id="contact.facebookUrl"
            name="contact.facebookUrl"
            defaultValue={str('contact.facebookUrl')}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contact.hours">เวลาทำการ</Label>
          <Input id="contact.hours" name="contact.hours" defaultValue={str('contact.hours')} />
        </div>
      </fieldset>

      <fieldset className="grid gap-2 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">การแสดงผล</legend>
        <Toggle name="display.showStock" label="แสดงจำนวนสต็อก" defaultChecked={bool('display.showStock', true)} />
        <Toggle name="display.lowStockBadge" label="แสดงป้ายเหลือน้อย" defaultChecked={bool('display.lowStockBadge', true)} />
      </fieldset>

      <div className="grid gap-2">
        <Label htmlFor="theme.default">ธีมเริ่มต้น</Label>
        <select
          id="theme.default"
          name="theme.default"
          defaultValue={str('theme.default', 'system')}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="system">ตามระบบ</option>
          <option value="light">สว่าง</option>
          <option value="dark">มืด</option>
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="payment.promptpayId">PromptPay ID (เบอร์/เลขบัตร)</Label>
        <Input id="payment.promptpayId" name="payment.promptpayId" defaultValue={str('payment.promptpayId')} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="shipping.feeBaht">ค่าจัดส่ง (บาท)</Label>
        <Input id="shipping.feeBaht" name="shipping.feeBaht" type="number" min={0} step="0.01" defaultValue={shippingBaht} />
      </div>

      <fieldset className="grid gap-2 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">ฟีเจอร์</legend>
        <Toggle name="feature.couponsEnabled" label="เปิดระบบคูปอง" defaultChecked={bool('feature.couponsEnabled', true)} />
        <Toggle name="feature.reviewsEnabled" label="เปิดระบบรีวิว" defaultChecked={bool('feature.reviewsEnabled', true)} />
      </fieldset>

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
