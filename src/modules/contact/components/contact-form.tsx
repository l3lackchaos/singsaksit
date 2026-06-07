'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { submitContactAction, type ContactState } from '../actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? 'กำลังส่ง…' : 'ส่งข้อความ'}
    </Button>
  );
}

export function ContactForm() {
  const [state, action] = useActionState(submitContactAction, {} as ContactState);

  if (state.ok) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-6 py-12 text-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <h3 className="font-display text-xl font-semibold">ได้รับข้อความแล้ว</h3>
        <p className="measure text-muted-foreground">
          ขอบคุณที่ติดต่อเรา ทีมงานจะติดต่อกลับโดยเร็วที่สุด
          หากต้องการคำตอบทันทีสามารถติดต่อผ่านช่องทางด้านข้างได้เลย
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-5 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
      {state.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      <div className="grid gap-2">
        <Label htmlFor="contact-name">ชื่อ</Label>
        <Input id="contact-name" name="name" autoComplete="name" maxLength={100} required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contact-contact">อีเมลหรือเบอร์โทรสำหรับติดต่อกลับ</Label>
        <Input
          id="contact-contact"
          name="contact"
          inputMode="text"
          maxLength={120}
          placeholder="เช่น you@email.com หรือ 08x-xxx-xxxx"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contact-message">ข้อความ</Label>
        <Textarea
          id="contact-message"
          name="message"
          rows={6}
          minLength={10}
          maxLength={2000}
          placeholder="สอบถามเรื่องพระเครื่อง การเช่าบูชา หรือการจัดส่งได้ที่นี่"
          required
        />
      </div>

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
