import { AdminHelp, ProductPreview } from '@/modules/admin/components/admin-help';
import { ProductForm } from '@/modules/admin/components/product-form';

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">เพิ่มสินค้าใหม่</h1>
      <div className="mt-6">
        <AdminHelp
          what="กรอกข้อมูลสินค้าใหม่แล้วบันทึก ระบบจะสร้าง slug อัตโนมัติและเพิ่มเข้าคลัง (อัปโหลดรูปได้หลังบันทึก) เมื่อตั้งสถานะเป็นเผยแพร่จะแสดงในหน้าร้าน"
          preview={<ProductPreview />}
        />
      </div>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
