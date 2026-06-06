import type { Metadata } from 'next';
import Link from 'next/link';
import { SignUpForm, OAuthButtons } from '@/modules/auth/components/auth-forms';

export const metadata: Metadata = { title: 'สมัครสมาชิก', robots: { index: false } };

export default function SignUpPage() {
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-bold">สมัครสมาชิก</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          สร้างบัญชีเพื่อสั่งซื้อและติดตามสถานะ
        </p>
        <div className="mt-6">
          <SignUpForm />
        </div>
        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> หรือ <span className="h-px flex-1 bg-border" />
        </div>
        <OAuthButtons />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          มีบัญชีอยู่แล้ว?{' '}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}
