import { AdminHelp, UserPreview } from '@/modules/admin/components/admin-help';
import { listUsers } from '@/modules/admin/repository';
import { RoleSelect } from '@/modules/admin/components/role-select';

export default async function AdminUsersPage() {
  const users = await listUsers();
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">ผู้ใช้และสิทธิ์</h1>
      <div className="mt-6">
        <AdminHelp
          what="จัดการสิทธิ์ของแต่ละบัญชี เปลี่ยนเป็น ADMIN เพื่อให้เข้าหลังบ้านได้ หรือกำหนดเป็น STAFF/CUSTOMER ตามบทบาท เปลี่ยนแล้วมีผลทันที"
          preview={<UserPreview />}
        />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{users.length} บัญชี</p>
      <ul className="mt-6 divide-y rounded-lg border">
        {users.map((u) => (
          <li key={u.id} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="font-medium">{u.name || '—'}</p>
              <p className="truncate text-sm text-muted-foreground">{u.email}</p>
            </div>
            <RoleSelect userId={u.id} role={u.role} />
          </li>
        ))}
      </ul>
    </div>
  );
}
