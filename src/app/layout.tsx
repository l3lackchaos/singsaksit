import type { Metadata, Viewport } from 'next';
import { Sarabun, Trirong } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Analytics } from '@/components/analytics';
import { ServiceWorkerRegister } from '@/components/sw-register';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getSetting } from '@/lib/settings';

const sarabun = Sarabun({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const trirong = Trirong({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const storeName = getSetting('store.name');

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: `${storeName} — ศูนย์รวมพระเครื่องแท้`,
    template: `%s | ${storeName}`,
  },
  description:
    'ร้านพระเครื่องออนไลน์ ชำระเงินผ่าน PromptPay/โอนธนาคาร พร้อมระบบยืนยันสลิปและติดตามสถานะแบบเรียลไทม์',
};

export const viewport: Viewport = {
  themeColor: '#9a6a2f',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={`${sarabun.variable} ${trirong.variable}`}
    >
      <body className="min-h-screen antialiased">
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            ข้ามไปยังเนื้อหาหลัก
          </a>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </div>
          <Analytics />
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}
