'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/modules/cart/cart-store';
import { createOrderAction } from '@/modules/orders/checkout-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatThb } from '@/lib/money';

type Method = 'PROMPTPAY' | 'BANK_TRANSFER';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear, hydrated } = useCart();
  const [method, setMethod] = React.useState<Method>('PROMPTPAY');
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  if (hydrated && items.length === 0) {
    return (
      <div className="container py-24 text-center text-muted-foreground">
        ตะกร้าว่างเปล่า — <a href="/products" className="text-primary underline">เลือกชมพระเครื่อง</a>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const address = {
      recipient: String(fd.get('recipient') ?? ''),
      phone: String(fd.get('phone') ?? ''),
      line1: String(fd.get('line1') ?? ''),
      subdistrict: String(fd.get('subdistrict') ?? ''),
      district: String(fd.get('district') ?? ''),
      province: String(fd.get('province') ?? ''),
      postalCode: String(fd.get('postalCode') ?? ''),
    };
    const coupon = String(fd.get('coupon') ?? '').trim();

    startTransition(async () => {
      const result = await createOrderAction({
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        address,
        method,
        coupon: coupon || undefined,
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
    <div className="container py-10">
      <h1 className="text-2xl font-bold tracking-tight">ชำระเงิน</h1>
      <form onSubmit={onSubmit} className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <section className="rounded-lg border p-5">
            <h2 className="font-semibold">ที่อยู่จัดส่ง</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field name="recipient" label="ชื่อผู้รับ" />
              <Field name="phone" label="เบอร์โทร" type="tel" />
              <div className="sm:col-span-2">
                <Field name="line1" label="ที่อยู่ (บ้านเลขที่ ถนน)" />
              </div>
              <Field name="subdistrict" label="ตำบล/แขวง" />
              <Field name="district" label="อำเภอ/เขต" />
              <Field name="province" label="จังหวัด" />
              <Field name="postalCode" label="รหัสไปรษณีย์" />
            </div>
          </section>

          <section className="rounded-lg border p-5">
            <h2 className="font-semibold">วิธีชำระเงิน</h2>
            <div className="mt-4 grid gap-3">
              <MethodOption
                value="PROMPTPAY"
                current={method}
                onSelect={setMethod}
                title="PromptPay QR"
                desc="สแกนจ่ายแล้วอัปโหลดสลิป"
              />
              <MethodOption
                value="BANK_TRANSFER"
                current={method}
                onSelect={setMethod}
                title="โอนผ่านธนาคาร"
                desc="โอนเข้าบัญชีร้านแล้วอัปโหลดสลิป"
              />
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
            <Input id="coupon" name="coupon" placeholder="เช่น WELCOME10" />
          </div>
          <Button type="submit" size="lg" className="mt-6 w-full" disabled={pending}>
            {pending ? 'กำลังสร้างคำสั่งซื้อ…' : 'ยืนยันคำสั่งซื้อ'}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            ค่าจัดส่งและส่วนลดจะถูกคำนวณและแสดงในหน้าถัดไป
          </p>
        </aside>
      </form>
    </div>
  );
}

function Field({ name, label, type = 'text' }: { name: string; label: string; type?: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required />
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
      className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 ${
        active ? 'border-primary ring-1 ring-primary' : ''
      }`}
    >
      <input
        type="radio"
        name="method"
        value={value}
        checked={active}
        onChange={() => onSelect(value)}
        className="mt-1"
      />
      <span>
        <span className="block font-medium">{title}</span>
        <span className="block text-sm text-muted-foreground">{desc}</span>
      </span>
    </label>
  );
}
