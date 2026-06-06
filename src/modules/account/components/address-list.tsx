'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteAddressAction } from '../address-actions';
import type { SavedAddress } from '../address-repository';

export function AddressList({ addresses }: { addresses: SavedAddress[] }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  if (addresses.length === 0) {
    return <p className="text-sm text-muted-foreground">ยังไม่มีที่อยู่บันทึกไว้</p>;
  }

  return (
    <ul className="divide-y rounded-lg border">
      {addresses.map((a) => (
        <li key={a.id} className="flex items-start justify-between gap-4 p-4 text-sm">
          <div>
            <p className="font-medium">
              {a.recipient} · {a.phone}
              {a.isDefault && (
                <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  ค่าเริ่มต้น
                </span>
              )}
            </p>
            <p className="text-muted-foreground">
              {a.line1} ต.{a.subdistrict} อ.{a.district} จ.{a.province} {a.postalCode}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="ลบที่อยู่"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await deleteAddressAction(a.id);
                router.refresh();
              })
            }
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
