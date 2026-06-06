import type { Metadata } from 'next';
import Link from 'next/link';
import { SignInForm, OAuthButtons } from '@/modules/auth/components/auth-forms';

export const metadata: Metadata = { title: 'เข้าสู่ระบบ', robots: { index: false } };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-bold">เข้าสู่ระบบ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ยินดีต้อนรับกลับสู่สิ่งศักดิ์สิทธิ์
        </p>
        <div className="mt-6">
          <SignInForm next={next} />
        </div>
        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> หรือ <span className="h-px flex-1 bg-border" />
        </div>
        <OAuthButtons />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          ยังไม่มีบัญชี?{' '}
          <Link href="/sign-up" className="font-medium text-primary hover:underline">
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </div>
  );
}
