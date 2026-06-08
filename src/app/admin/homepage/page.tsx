import { AdminHelp, HomepagePreview } from '@/modules/admin/components/admin-help';
import { getAllSettings } from '@/modules/admin/repository';
import { HeroForm } from '@/modules/admin/components/hero-form';
import { CarouselAdsManager } from '@/modules/admin/components/carousel-ads-manager';

interface CarouselAd {
  id: string;
  imagePath: string;
  title: string;
  body: string;
  href: string;
}

export default async function AdminHomepagePage() {
  const settings = await getAllSettings();
  const str = (k: string, d = '') => (typeof settings[k] === 'string' ? (settings[k] as string) : d);
  const ads = Array.isArray(settings['homepage.carouselAds'])
    ? (settings['homepage.carouselAds'] as CarouselAd[])
    : [];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">จัดการหน้าแรก</h1>
      <div className="mt-6">
        <AdminHelp
          what="แก้ข้อความส่วนหัว (Hero) และจัดการสไลด์โฆษณา เมื่อบันทึกหรือเพิ่มสไลด์ จะแสดงบนหน้าแรกทันที (ถ้ามีสไลด์ตั้งแต่ 1 รายการ จะแสดงแทนการสุ่มสินค้าอัตโนมัติ)"
          preview={<HomepagePreview />}
        />
      </div>
        <p className="mt-1 text-sm text-muted-foreground">
          ปรับข้อความ Hero และสไลด์โฆษณาบนหน้าแรกได้เองโดยไม่ต้องแก้โค้ด
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">ส่วนหัว (Hero)</h2>
        <HeroForm
          values={{
            badge: str('hero.badge', 'พระแท้ ตรวจสอบได้ ชำระเงินปลอดภัย'),
            title: str('hero.title'),
            subtitle: str('hero.subtitle', 'ศูนย์รวมพระเครื่องมงคล'),
            description: str('hero.description'),
            primaryLabel: str('hero.primaryLabel', 'เลือกชมพระเครื่อง'),
            primaryHref: str('hero.primaryHref', '/products'),
            secondaryLabel: str('hero.secondaryLabel', 'เกี่ยวกับเรา'),
            secondaryHref: str('hero.secondaryHref', '/about'),
          }}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">สไลด์โฆษณา (Carousel)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            เมื่อมีสไลด์อย่างน้อย 1 รายการ หน้าแรกจะแสดงสไลด์เหล่านี้แทนการสุ่มสินค้าอัตโนมัติ
          </p>
        </div>
        <CarouselAdsManager ads={ads} />
      </section>
    </div>
  );
}
