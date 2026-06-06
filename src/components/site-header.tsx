import Link from 'next/link';
import { Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { CartNavButton } from '@/components/cart-nav-button';
import { getSetting } from '@/lib/settings';

export function SiteHeader() {
  const storeName = getSetting('store.name');

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-primary">
          {storeName}
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex" aria-label="หมวดหมู่">
          <Link href="/products" className="hover:text-primary">
            พระเครื่องทั้งหมด
          </Link>
          <Link href="/about" className="hover:text-primary">
            เกี่ยวกับเรา
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="ค้นหา" asChild>
            <Link href="/products">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          <CartNavButton />
          <Button variant="ghost" size="icon" aria-label="บัญชีของฉัน" asChild>
            <Link href="/account">
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
