import { notFound } from 'next/navigation';
import { getProduct } from '@/modules/admin/repository';
import { ProductForm } from '@/modules/admin/components/product-form';
import { satangToBaht } from '@/lib/money';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">แก้ไขสินค้า</h1>
      <div className="mt-6">
        <ProductForm
          defaults={{
            id: product.id,
            title: product.title,
            slug: product.slug,
            priceBaht: satangToBaht(product.price),
            stock: product.stock,
            status: product.status,
            description: product.description,
          }}
        />
      </div>
    </div>
  );
}
