import { AdminHelp, PagePreview } from '@/modules/admin/components/admin-help';
import Link from 'next/link';
import { listCmsPages } from '@/modules/admin/repository';
import { CmsPageForm } from '@/modules/admin/components/cms-page-form';

export default async function AdminPagesPage() {
  const pages = await listCmsPages();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">หน้าเนื้อหา (CMS)</h1>
      <div className="mt-6">
        <AdminHelp
          what="สร้างหรือแก้ไขหน้าเนื้อหา เช่น วิธีสั่งซื้อ เงื่อนไขการใช้งาน เมื่อเผยแพร่จะเข้าถึงได้ที่ /pages/ชื่อหน้า และถูกเพิ่มในแผนผังเว็บ (sitemap) อัตโนมัติ"
          preview={<PagePreview />}
        />
      </div>
        <p className="mt-1 text-sm text-muted-foreground">สร้าง/แก้ไขหน้าได้เองโดยไม่ต้องแก้โค้ด</p>
      </div>
      <CmsPageForm />
      <ul className="divide-y rounded-lg border">
        {pages.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/pages/${p.id}`} className="flex items-center justify-between p-4 hover:bg-muted/40">
              <span className="font-medium">{p.title}</span>
              <span className="text-sm text-muted-foreground">
                /pages/{p.slug} · {p.published ? 'เผยแพร่' : 'ฉบับร่าง'}
              </span>
            </Link>
          </li>
        ))}
        {pages.length === 0 && <li className="p-4 text-sm text-muted-foreground">ยังไม่มีหน้า</li>}
      </ul>
    </div>
  );
}
