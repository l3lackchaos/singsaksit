import Link from 'next/link';
import { getDashboardStats } from '@/modules/admin/repository';

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  const cards = [
    { label: 'รอตรวจสลิป', value: stats.pendingReview, href: '/admin/payments', highlight: true },
    { label: 'ออร์เดอร์ที่ชำระแล้ว', value: stats.paidOrders, href: '/admin/orders' },
    { label: 'สินค้า', value: stats.products, href: '/admin/products' },
    { label: 'สมาชิก', value: stats.customers, href: '/admin' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">ภาพรวม</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`rounded-lg border p-5 hover:shadow-sm ${
              c.highlight && c.value > 0 ? 'border-warning bg-warning/5' : 'bg-card'
            }`}
          >
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
