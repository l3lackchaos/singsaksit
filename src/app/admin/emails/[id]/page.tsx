import { notFound } from 'next/navigation';
import { getEmailTemplateById } from '@/modules/admin/repository';
import { EmailTemplateForm } from '@/modules/admin/components/email-template-form';

export default async function EditEmailTemplate({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tpl = await getEmailTemplateById(id);
  if (!tpl) notFound();
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">แก้ไขเทมเพลต: {tpl.key}</h1>
      <div className="mt-6">
        <EmailTemplateForm id={tpl.id} subject={tpl.subject} body={tpl.body} />
      </div>
    </div>
  );
}
