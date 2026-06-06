import type { Metadata } from 'next';
import Link from 'next/link';
import { ForgotPasswordForm } from '@/modules/auth/components/auth-forms';

export const metadata: Metadata = { title: 'ลืมรหัสผ่าน', robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-bold">ลืมรหัสผ่าน</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          กรอกอีเมลเพื่อรับลิงก์ตั้งรหัสผ่านใหม่
        </p>
        <div className="mt-6">
          <ForgotPasswordForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}
