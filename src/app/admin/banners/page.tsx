import { AdminHelp, BannerPreview } from '@/modules/admin/components/admin-help';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { BannerForm } from '@/modules/admin/components/banner-form';
import { BannerManager } from '@/modules/admin/components/banner-manager';

interface BannerRow {
  id: string;
  title: string;
  body: string;
  href: string | null;
  published: boolean;
}

export default async function AdminBannersPage() {
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from('Banner')
    .select('id,title,body,href,published')
    .order('sortOrder', { ascending: true });
  const banners = (data ?? []) as BannerRow[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">แบนเนอร์ประกาศ</h1>
      <div className="mt-6">
        <AdminHelp
          what="เพิ่ม แก้ไข หรือลบแถบประกาศด้านบนสุดของหน้าแรก เมื่อตั้งเป็นเผยแพร่ แถบจะแสดงให้ลูกค้าเห็น เหมาะกับโปรโมชันหรือประกาศของร้าน"
          preview={<BannerPreview />}
        />
      </div>
        <p className="mt-1 text-sm text-muted-foreground">
          แถบประกาศด้านบนสุดของหน้าแรก (เช่น โปรโมชัน ประกาศร้าน)
        </p>
      </div>
      <BannerForm />
      <BannerManager banners={banners} />
    </div>
  );
}
