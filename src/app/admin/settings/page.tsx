import { getAllSettings } from '@/modules/admin/repository';
import { SettingsForm } from '@/modules/admin/components/settings-form';

export default async function AdminSettingsPage() {
  const settings = await getAllSettings();
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">ตั้งค่าระบบ</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        ค่าทั้งหมดนี้ปรับได้โดยไม่ต้องแก้โค้ด
      </p>
      <div className="mt-6">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
