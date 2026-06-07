import Link from 'next/link';
import { CookieSettingsLink } from '@/components/cookie-settings-link';
import { getSetting } from '@/lib/settings';

export function SiteFooter() {
  const storeName = getSetting('store.name');
  const year = new Date().getFullYear();

  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="container grid gap-8 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-xl font-semibold text-footer-accent">{storeName}</p>
          <p className="mt-3 max-w-xs text-sm text-footer-foreground/70">
            ศูนย์รวมพระเครื่องแท้ พร้อมระบบยืนยันการชำระเงินที่ปลอดภัยและโปร่งใส
          </p>
        </div>
        <nav className="text-sm" aria-label="ลิงก์ร้านค้า">
          <p className="mb-3 font-medium">ร้านค้า</p>
          <ul className="space-y-2 text-footer-foreground/70">
            <li>
              <Link href="/products" className="transition-colors hover:text-footer-accent">
                พระเครื่องทั้งหมด
              </Link>
            </li>
            <li>
              <Link href="/about" className="transition-colors hover:text-footer-accent">
                เกี่ยวกับเรา
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition-colors hover:text-footer-accent">
                ติดต่อเรา
              </Link>
            </li>
          </ul>
        </nav>
        <nav className="text-sm" aria-label="นโยบาย">
          <p className="mb-3 font-medium">นโยบาย</p>
          <ul className="space-y-2 text-footer-foreground/70">
            <li>
              <Link href="/privacy" className="transition-colors hover:text-footer-accent">
                นโยบายความเป็นส่วนตัว
              </Link>
            </li>
            <li>
              <CookieSettingsLink />
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-footer-foreground/15 py-5 text-center text-xs text-footer-foreground/55">
        © {year} {storeName}. สงวนลิขสิทธิ์
      </div>
    </footer>
  );
}
