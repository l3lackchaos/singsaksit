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
        <p className="mt-1 text-sm text-muted-foreground">
          แถบประกาศด้านบนสุดของหน้าแรก (เช่น โปรโมชัน ประกาศร้าน)
        </p>
      </div>
      <BannerForm />
      <BannerManager banners={banners} />
    </div>
  );
}
