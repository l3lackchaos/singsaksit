import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'นโยบายความเป็นส่วนตัว',
  description: 'นโยบายความเป็นส่วนตัวและการคุ้มครองข้อมูลส่วนบุคคล (PDPA) ของสิ่งศักดิ์สิทธิ์',
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-2xl py-12">
      <h1 className="text-2xl font-bold tracking-tight">นโยบายความเป็นส่วนตัว</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          เราเก็บรวบรวมข้อมูลส่วนบุคคล (ชื่อ ที่อยู่ เบอร์โทร และหลักฐานการชำระเงิน)
          เพื่อดำเนินการคำสั่งซื้อและจัดส่งสินค้าเท่านั้น สอดคล้องกับ พ.ร.บ.
          คุ้มครองข้อมูลส่วนบุคคล (PDPA)
        </p>
        <h2 className="font-semibold text-foreground">คุกกี้และการติดตาม</h2>
        <p>
          คุกกี้เพื่อการวิเคราะห์และการตลาด (GA4 / GTM / Meta Pixel)
          จะทำงานเมื่อคุณให้ความยินยอมเท่านั้น คุณเปลี่ยนการตั้งค่าได้ทุกเมื่อจากลิงก์
          “ตั้งค่าคุกกี้” ด้านล่างของทุกหน้า
        </p>
        <h2 className="font-semibold text-foreground">การเก็บรักษาและสิทธิของคุณ</h2>
        <p>
          หลักฐานการชำระเงินถูกเก็บในพื้นที่ส่วนตัวและเข้าถึงได้เฉพาะเจ้าของบัญชีและผู้ดูแล
          ผ่านลิงก์ที่มีอายุจำกัด คุณมีสิทธิขอเข้าถึง แก้ไข หรือลบข้อมูลของคุณได้
          โดยติดต่อผู้ดูแลร้าน
        </p>
      </div>
    </div>
  );
}
