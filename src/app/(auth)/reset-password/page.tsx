'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const password = String(new FormData(e.currentTarget).get('password') ?? '');
    if (password.length < 8) {
      setError('รหัสผ่านอย่างน้อย 8 ตัวอักษร');
      return;
    }
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        setError('ตั้งรหัสผ่านใหม่ไม่สำเร็จ — ลิงก์อาจหมดอายุ');
        return;
      }
      setDone(true);
      setTimeout(() => router.push('/account'), 1200);
    });
  }

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-bold">ตั้งรหัสผ่านใหม่</h1>
        {done ? (
          <p className="mt-4 rounded-md bg-success/10 px-3 py-2 text-sm text-success">
            ตั้งรหัสผ่านใหม่เรียบร้อย กำลังพาไปยังบัญชีของคุณ…
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            {error && (
              <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="grid gap-2">
              <Label htmlFor="password">รหัสผ่านใหม่</Label>
              <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'กำลังบันทึก…' : 'บันทึกรหัสผ่าน'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
