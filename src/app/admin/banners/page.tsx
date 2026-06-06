import { createSupabaseServerClient } from '@/lib/supabase/server';
import { BannerForm } from '@/modules/admin/components/banner-form';

export default async function AdminBannersPage() {
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from('Banner')
    .select('id,title,published')
    .order('sortOrder', { ascending: true });
  const banners = (data ?? []) as { id: string; title: string; published: boolean }[];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">แบนเนอร์หน้าแรก</h1>
      <BannerForm />
      <ul className="divide-y rounded-lg border">
        {banners.map((b) => (
          <li key={b.id} className="flex items-center justify-between p-4">
            <span className="font-medium">{b.title}</span>
            <span className="text-sm text-muted-foreground">
              {b.published ? 'เผยแพร่' : 'ฉบับร่าง'}
            </span>
          </li>
        ))}
        {banners.length === 0 && <li className="p-4 text-sm text-muted-foreground">ยังไม่มีแบนเนอร์</li>}
      </ul>
    </div>
  );
}
