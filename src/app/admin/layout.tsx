import type { Metadata } from 'next';
import Link from 'next/link';
import {
  LayoutDashboard,
  Receipt,
  Package,
  Settings,
  ClipboardCheck,
  Link2,
  Star,
  FileText,
  GalleryHorizontalEnd,
  Ticket,
  Users,
  Mail,
} from 'lucide-react';
import { requireAdmin } from '@/lib/auth';

export const metadata: Metadata = { title: 'ผู้ดูแลระบบ', robots: { index: false } };

const NAV = [
  { href: '/admin', label: 'ภาพรวม', icon: LayoutDashboard },
  { href: '/admin/payments', label: 'ตรวจสลิป', icon: ClipboardCheck },
  { href: '/admin/orders', label: 'คำสั่งซื้อ', icon: Receipt },
  { href: '/admin/products', label: 'สินค้า', icon: Package },
  { href: '/admin/reviews', label: 'รีวิว', icon: Star },
  { href: '/admin/coupons', label: 'คูปอง', icon: Ticket },
  { href: '/admin/pages', label: 'หน้าเนื้อหา', icon: FileText },
  { href: '/admin/banners', label: 'แบนเนอร์', icon: GalleryHorizontalEnd },
  { href: '/admin/emails', label: 'อีเมล', icon: Mail },
  { href: '/admin/links', label: 'ย่อลิงก์', icon: Link2 },
  { href: '/admin/users', label: 'ผู้ใช้', icon: Users },
  { href: '/admin/settings', label: 'ตั้งค่า', icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="container grid gap-8 py-8 md:grid-cols-[200px_1fr]">
      <aside className="h-fit">
        <p className="mb-3 px-3 text-xs font-semibold uppercase text-muted-foreground">
          ผู้ดูแลระบบ
        </p>
        <nav className="grid gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
