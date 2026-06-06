import { notFound } from 'next/navigation';
import { getProduct, getProductImages } from '@/modules/admin/repository';
import { ProductForm } from '@/modules/admin/components/product-form';
import { ProductImages } from '@/modules/admin/components/product-images';
import { satangToBaht } from '@/lib/money';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, images] = await Promise.all([getProduct(id), getProductImages(id)]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">แก้ไขสินค้า</h1>
      <ProductImages productId={product.id} images={images} />
      <div>
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
