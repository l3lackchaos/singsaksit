import { AdminHelp, SettingsPreview } from '@/modules/admin/components/admin-help';
import { getAllSettings } from '@/modules/admin/repository';
import { SettingsForm } from '@/modules/admin/components/settings-form';

export default async function AdminSettingsPage() {
  const settings = await getAllSettings();
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">ตั้งค่าระบบ</h1>
      <div className="mt-6">
        <AdminHelp
          what="ปรับค่าร้านโดยไม่ต้องแก้โค้ด เช่น ชื่อร้าน ช่องทางติดต่อ ค่าจัดส่ง การแสดงสต็อก และเปิด/ปิดฟีเจอร์ บันทึกแล้วมีผลทั่วทั้งเว็บทันที"
          preview={<SettingsPreview />}
        />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        ค่าทั้งหมดนี้ปรับได้โดยไม่ต้องแก้โค้ด
      </p>
      <div className="mt-6">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
