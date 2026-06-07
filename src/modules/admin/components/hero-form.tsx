'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateHeroAction, type ActionResult } from '@/modules/admin/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface HeroValues {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'กำลังบันทึก…' : 'บันทึก Hero'}
    </Button>
  );
}

export function HeroForm({ values }: { values: HeroValues }) {
  const [state, action] = useActionState(updateHeroAction, {} as ActionResult);

  return (
    <form action={action} className="grid max-w-xl gap-4 rounded-lg border p-4">
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-success">{state.success}</p>}

      <div className="grid gap-2">
        <Label htmlFor="hero.badge">ป้ายเล็กด้านบน</Label>
        <Input id="hero.badge" name="hero.badge" defaultValue={values.badge} maxLength={120} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="hero.title">หัวข้อหลัก (เว้นว่าง = ใช้ชื่อร้าน)</Label>
        <Input id="hero.title" name="hero.title" defaultValue={values.title} maxLength={120} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="hero.subtitle">หัวข้อรอง (ตัวหนาสีทอง)</Label>
        <Input
          id="hero.subtitle"
          name="hero.subtitle"
          defaultValue={values.subtitle}
          maxLength={160}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="hero.description">คำอธิบาย</Label>
        <Textarea
          id="hero.description"
          name="hero.description"
          defaultValue={values.description}
          rows={3}
          maxLength={400}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="hero.primaryLabel">ปุ่มหลัก — ข้อความ</Label>
          <Input
            id="hero.primaryLabel"
            name="hero.primaryLabel"
            defaultValue={values.primaryLabel}
            maxLength={60}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="hero.primaryHref">ปุ่มหลัก — ลิงก์</Label>
          <Input
            id="hero.primaryHref"
            name="hero.primaryHref"
            defaultValue={values.primaryHref}
            maxLength={300}
            placeholder="/products"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="hero.secondaryLabel">ปุ่มรอง — ข้อความ</Label>
          <Input
            id="hero.secondaryLabel"
            name="hero.secondaryLabel"
            defaultValue={values.secondaryLabel}
            maxLength={60}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="hero.secondaryHref">ปุ่มรอง — ลิงก์</Label>
          <Input
            id="hero.secondaryHref"
            name="hero.secondaryHref"
            defaultValue={values.secondaryHref}
            maxLength={300}
            placeholder="/about"
          />
        </div>
      </div>

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
