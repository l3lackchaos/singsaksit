import { ProductForm } from '@/modules/admin/components/product-form';

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">เพิ่มสินค้าใหม่</h1>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
