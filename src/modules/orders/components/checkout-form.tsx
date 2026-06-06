'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/modules/cart/cart-store';
import { createOrderAction } from '@/modules/orders/checkout-actions';
import type { SavedAddress } from '@/modules/account/address-repository';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatThb } from '@/lib/money';

type Method = 'PROMPTPAY' | 'BANK_TRANSFER';

const EMPTY = {
  recipient: '',
  phone: '',
  line1: '',
  subdistrict: '',
  district: '',
  province: '',
  postalCode: '',
};

type Addr = typeof EMPTY;

export function CheckoutForm({ savedAddresses }: { savedAddresses: SavedAddress[] }) {
  const router = useRouter();
  const { items, subtotal, clear, hydrated } = useCart();
  const [method, setMethod] = React.useState<Method>('PROMPTPAY');
  const [coupon, setCoupon] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  const defaultAddr = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
  const [addr, setAddr] = React.useState<Addr>(
    defaultAddr ? pick(defaultAddr) : EMPTY,
  );

  if (hydrated && items.length === 0) {
    return (
      <p className="py-24 text-center text-muted-foreground">
        ตะกร้าว่างเปล่า —{' '}
        <a href="/products" className="text-primary underline">
          เลือกชมพระเครื่อง
        </a>
      </p>
    );
  }

  function set<K extends keyof Addr>(key: K, value: string) {
    setAddr((a) => ({ ...a, [key]: value }));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await createOrderAction({
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        address: addr,
        method,
        coupon: coupon.trim() || undefined,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      clear();
      router.push(`/account/orders/${result.orderId}`);
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]"
    >
      <div className="space-y-6">
        {error && (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <section className="rounded-lg border p-5">
          <h2 className="font-semibold">ที่อยู่จัดส่ง</h2>

          {savedAddresses.length > 0 && (
            <div className="mt-3">
              <Label htmlFor="saved">เลือกที่อยู่ที่บันทึกไว้</Label>
              <select
                id="saved"
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                defaultValue={defaultAddr?.id ?? ''}
                onChange={(e) => {
                  const found = savedAddresses.find((a) => a.id === e.target.value);
                  setAddr(found ? pick(found) : EMPTY);
                }}
              >
                <option value="">— กรอกใหม่ —</option>
                {savedAddresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.recipient} · {a.line1}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="ชื่อผู้รับ" value={addr.recipient} onChange={(v) => set('recipient', v)} />
            <Field label="เบอร์โทร" value={addr.phone} onChange={(v) => set('phone', v)} />
            <div className="sm:col-span-2">
              <Field label="ที่อยู่ (บ้านเลขที่ ถนน)" value={addr.line1} onChange={(v) => set('line1', v)} />
            </div>
            <Field label="ตำบล/แขวง" value={addr.subdistrict} onChange={(v) => set('subdistrict', v)} />
            <Field label="อำเภอ/เขต" value={addr.district} onChange={(v) => set('district', v)} />
            <Field label="จังหวัด" value={addr.province} onChange={(v) => set('province', v)} />
            <Field label="รหัสไปรษณีย์" value={addr.postalCode} onChange={(v) => set('postalCode', v)} />
          </div>
        </section>

        <section className="rounded-lg border p-5">
          <h2 className="font-semibold">วิธีชำระเงิน</h2>
          <div className="mt-4 grid gap-3">
            <MethodOption value="PROMPTPAY" current={method} onSelect={setMethod} title="PromptPay QR" desc="สแกนจ่ายแล้วอัปโหลดสลิป" />
            <MethodOption value="BANK_TRANSFER" current={method} onSelect={setMethod} title="โอนผ่านธนาคาร" desc="โอนเข้าบัญชีร้านแล้วอัปโหลดสลิป" />
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-lg border bg-card p-6">
        <h2 className="font-semibold">สรุปคำสั่งซื้อ</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-2">
              <span className="line-clamp-1 text-muted-foreground">
                {i.title} × {i.qty}
              </span>
              <span className="tabular-nums">{formatThb(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t pt-3 text-sm">
          <span className="text-muted-foreground">ยอดรวมสินค้า</span>
          <span className="tabular-nums">{formatThb(subtotal)}</span>
        </div>
        <div className="mt-4 grid gap-2">
          <Label htmlFor="coupon">โค้ดส่วนลด (ถ้ามี)</Label>
          <Input id="coupon" value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="เช่น WELCOME10" />
        </div>
        <Button type="submit" size="lg" className="mt-6 w-full" disabled={pending}>
          {pending ? 'กำลังสร้างคำสั่งซื้อ…' : 'ยืนยันคำสั่งซื้อ'}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          ค่าจัดส่งและส่วนลดจะถูกคำนวณและแสดงในหน้าถัดไป
        </p>
      </aside>
    </form>
  );
}

function pick(a: SavedAddress): Addr {
  return {
    recipient: a.recipient,
    phone: a.phone,
    line1: a.line1,
    subdistrict: a.subdistrict,
    district: a.district,
    province: a.province,
    postalCode: a.postalCode,
  };
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} required />
    </div>
  );
}

function MethodOption({
  value,
  current,
  onSelect,
  title,
  desc,
}: {
  value: Method;
  current: Method;
  onSelect: (m: Method) => void;
  title: string;
  desc: string;
}) {
  const active = current === value;
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 ${active ? 'border-primary ring-1 ring-primary' : ''}`}
    >
      <input type="radio" name="method" value={value} checked={active} onChange={() => onSelect(value)} className="mt-1" />
      <span>
        <span className="block font-medium">{title}</span>
        <span className="block text-sm text-muted-foreground">{desc}</span>
      </span>
    </label>
  );
}
