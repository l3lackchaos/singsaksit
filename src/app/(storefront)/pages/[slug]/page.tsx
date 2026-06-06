import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedPage } from '@/modules/cms/repository';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) return { title: 'ไม่พบหน้า' };
  return { title: page.title };
}

export default async function CmsPageView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) notFound();

  return (
    <article className="container max-w-2xl py-12">
      <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
      {/* Body is sanitized on save (sanitize-html). */}
      <div
        className="prose prose-neutral mt-6 max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: page.body }}
      />
    </article>
  );
}
