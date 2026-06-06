import { notFound } from 'next/navigation';
import { getCmsPage } from '@/modules/admin/repository';
import { CmsPageForm } from '@/modules/admin/components/cms-page-form';

export default async function EditCmsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await getCmsPage(id);
  if (!page) notFound();
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">แก้ไขหน้า</h1>
      <div className="mt-6">
        <CmsPageForm
          defaults={{
            id: page.id,
            title: page.title,
            slug: page.slug,
            body: page.body,
            published: page.published,
          }}
        />
      </div>
    </div>
  );
}
