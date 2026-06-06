import Link from 'next/link';
import { listEmailTemplates } from '@/modules/admin/repository';

export default async function AdminEmailsPage() {
  const templates = await listEmailTemplates();
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">เทมเพลตอีเมล</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        แก้หัวข้อ/เนื้อหาอีเมลที่ส่งให้ลูกค้าได้เอง
      </p>
      <ul className="mt-6 divide-y rounded-lg border">
        {templates.map((t) => (
          <li key={t.id}>
            <Link
              href={`/admin/emails/${t.id}`}
              className="flex items-center justify-between p-4 hover:bg-muted/40"
            >
              <span className="font-mono text-sm">{t.key}</span>
              <span className="truncate text-sm text-muted-foreground">{t.subject}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
