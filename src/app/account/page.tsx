import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart, Package, LogOut } from 'lucide-react';
import { getProfile } from '@/lib/auth';
import { signOutAction } from '@/modules/auth/actions';
import { ProfileForm } from '@/modules/account/components/profile-form';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'บัญชีของฉัน', robots: { index: false } };

export default async function AccountPage() {
  const profile = await getProfile();
  // Middleware guarantees an authenticated user on /account.
  if (!profile) return null;

  return (
    <div className="container max-w-3xl py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">บัญชีของฉัน</h1>
        <form action={signOutAction}>
          <Button variant="ghost" size="sm" type="submit">
            <LogOut className="h-4 w-4" /> ออกจากระบบ
          </Button>
        </form>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/account/orders"
          className="flex items-center gap-3 rounded-lg border bg-card p-4 hover:shadow-sm"
        >
          <Package className="h-6 w-6 text-primary" />
          <div>
            <p className="font-medium">คำสั่งซื้อของฉัน</p>
            <p className="text-sm text-muted-foreground">ติดตามสถานะการชำระเงินและจัดส่ง</p>
          </div>
        </Link>
        <Link
          href="/account/wishlist"
          className="flex items-center gap-3 rounded-lg border bg-card p-4 hover:shadow-sm"
        >
          <Heart className="h-6 w-6 text-primary" />
          <div>
            <p className="font-medium">รายการโปรด</p>
            <p className="text-sm text-muted-foreground">พระเครื่องที่คุณบันทึกไว้</p>
          </div>
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">ข้อมูลส่วนตัว</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          บทบาท: {profile.role === 'CUSTOMER' ? 'ลูกค้า' : profile.role}
        </p>
        <div className="mt-4">
          <ProfileForm
            email={profile.email}
            defaultName={profile.name ?? ''}
            defaultPhone={profile.phone ?? ''}
          />
        </div>
      </section>
    </div>
  );
}
