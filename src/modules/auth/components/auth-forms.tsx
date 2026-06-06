'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  requestPasswordResetAction,
  signInAction,
  signInWithProviderAction,
  signUpAction,
  type AuthState,
} from '../actions';

const initial: AuthState = {};

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'กำลังดำเนินการ…' : children}
    </Button>
  );
}

function Feedback({ state }: { state: AuthState }) {
  if (state.error) {
    return (
      <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p role="status" className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
        {state.success}
      </p>
    );
  }
  return null;
}

export function OAuthButtons() {
  return (
    <div className="grid gap-2">
      <form action={signInWithProviderAction.bind(null, 'google')}>
        <Button type="submit" variant="outline" className="w-full">
          เข้าสู่ระบบด้วย Google
        </Button>
      </form>
      <form action={signInWithProviderAction.bind(null, 'facebook')}>
        <Button type="submit" variant="outline" className="w-full">
          เข้าสู่ระบบด้วย Facebook
        </Button>
      </form>
    </div>
  );
}

export function SignInForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signInAction, initial);
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="next" value={next ?? '/account'} />
      <Feedback state={state} />
      <div className="grid gap-2">
        <Label htmlFor="email">อีเมล</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">รหัสผ่าน</Label>
          <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
            ลืมรหัสผ่าน?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <SubmitButton>เข้าสู่ระบบ</SubmitButton>
    </form>
  );
}

export function SignUpForm() {
  const [state, action] = useActionState(signUpAction, initial);
  return (
    <form action={action} className="grid gap-4">
      <Feedback state={state} />
      <div className="grid gap-2">
        <Label htmlFor="name">ชื่อ</Label>
        <Input id="name" name="name" type="text" autoComplete="name" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">อีเมล</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">รหัสผ่าน</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <SubmitButton>สมัครสมาชิก</SubmitButton>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordResetAction, initial);
  return (
    <form action={action} className="grid gap-4">
      <Feedback state={state} />
      <div className="grid gap-2">
        <Label htmlFor="email">อีเมล</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <SubmitButton>ส่งลิงก์รีเซ็ตรหัสผ่าน</SubmitButton>
    </form>
  );
}
