import Link from 'next/link';
import { CookieSettingsLink } from '@/components/cookie-settings-link';
import { getSetting } from '@/lib/settings';

export function SiteFooter() {
  const storeName = getSetting('store.name');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container grid gap-8 py-10 md:grid-cols-3">
        <div>
          <p className="text-base font-semibold text-primary">{storeName}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            ศูนย์รวมพระเครื่องแท้ พร้อมระบบยืนยันการชำระเงินที่ปลอดภัยและโปร่งใส
          </p>
        </div>
        <nav className="text-sm" aria-label="ลิงก์ร้านค้า">
          <p className="mb-2 font-medium">ร้านค้า</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>
              <Link href="/products" className="hover:text-primary">
                พระเครื่องทั้งหมด
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-primary">
                เกี่ยวกับเรา
              </Link>
            </li>
          </ul>
        </nav>
        <nav className="text-sm" aria-label="นโยบาย">
          <p className="mb-2 font-medium">นโยบาย</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>
              <Link href="/privacy" className="hover:text-primary">
                นโยบายความเป็นส่วนตัว
              </Link>
            </li>
            <li>
              <CookieSettingsLink />
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {year} {storeName}. สงวนลิขสิทธิ์
      </div>
    </footer>
  );
}
