'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { changeRoleAction } from '@/modules/admin/actions';

export function RoleSelect({ userId, role }: { userId: string; role: string }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  return (
    <select
      defaultValue={role}
      disabled={pending}
      aria-label="สิทธิ์ผู้ใช้"
      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
      onChange={(e) => {
        const next = e.target.value;
        startTransition(async () => {
          await changeRoleAction(userId, next);
          router.refresh();
        });
      }}
    >
      <option value="CUSTOMER">ลูกค้า</option>
      <option value="STAFF">พนักงาน</option>
      <option value="ADMIN">แอดมิน</option>
    </select>
  );
}
