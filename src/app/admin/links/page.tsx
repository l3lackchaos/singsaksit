import { AdminHelp, LinkPreview } from '@/modules/admin/components/admin-help';
import { listShortLinks } from '@/modules/admin/repository';
import { ShortLinkForm } from '@/modules/admin/components/short-link-form';
import { env } from '@/lib/env';

export default async function AdminLinksPage() {
  const links = await listShortLinks();
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">ระบบย่อลิงก์</h1>
      <div className="mt-6">
        <AdminHelp
          what="สร้างลิงก์สั้น /s/โค้ด ที่พาไปยังปลายทางที่กำหนด พร้อมนับจำนวนคลิก เหมาะกับแชร์โปรโมชันหรือสินค้าในช่องทางต่าง ๆ"
          preview={<LinkPreview />}
        />
      </div>
      <div className="mt-6">
        <ShortLinkForm />
      </div>

      <ul className="mt-6 divide-y rounded-lg border">
        {links.map((l) => (
          <li key={l.code} className="flex items-center justify-between gap-4 p-4 text-sm">
            <div className="min-w-0">
              <p className="font-medium">
                {env.siteUrl}/s/{l.code}
              </p>
              <p className="line-clamp-1 text-muted-foreground">{l.targetUrl}</p>
            </div>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {l.clicks} คลิก
            </span>
          </li>
        ))}
      </ul>
      {links.length === 0 && (
        <p className="mt-10 text-center text-muted-foreground">ยังไม่มีลิงก์</p>
      )}
    </div>
  );
}
