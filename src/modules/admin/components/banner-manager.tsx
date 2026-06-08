'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Eye, EyeOff, X } from 'lucide-react';
import {
  updateBannerAction,
  toggleBannerAction,
  deleteBannerAction,
} from '@/modules/admin/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BannerRow {
  id: string;
  title: string;
  body: string;
  href: string | null;
  published: boolean;
}

export function BannerManager({ banners }: { banners: BannerRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  function run(fn: () => Promise<{ error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  if (banners.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        ยังไม่มีแบนเนอร์ประกาศ — เพิ่มด้านบน
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <ul className="divide-y rounded-lg border">
        {banners.map((b) =>
          editing === b.id ? (
            <li key={b.id} className="p-4">
              <form
                action={async (fd) => {
                  fd.set('id', b.id);
                  setError(null);
                  const res = await updateBannerAction({}, fd);
                  if (res.error) setError(res.error);
                  else {
                    setEditing(null);
                    router.refresh();
                  }
                }}
                className="grid gap-3"
              >
                <div className="grid gap-2">
                  <Label htmlFor={`title-${b.id}`}>หัวข้อ</Label>
                  <Input id={`title-${b.id}`} name="title" defaultValue={b.title} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`body-${b.id}`}>ข้อความ</Label>
                  <Input id={`body-${b.id}`} name="body" defaultValue={b.body} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`href-${b.id}`}>ลิงก์ (ถ้ามี)</Label>
                  <Input
                    id={`href-${b.id}`}
                    name="href"
                    defaultValue={b.href ?? ''}
                    placeholder="/products"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="published"
                    defaultChecked={b.published}
                    className="h-4 w-4"
                  />
                  เผยแพร่
                </label>
                <div className="flex gap-2">
                  <Button type="submit" size="sm">
                    บันทึก
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditing(null)}
                  >
                    <X className="h-4 w-4" /> ยกเลิก
                  </Button>
                </div>
              </form>
            </li>
          ) : (
            <li key={b.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{b.title}</p>
                {b.body && <p className="truncate text-sm text-muted-foreground">{b.body}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <span
                  className={`mr-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    b.published
                      ? 'bg-success/15 text-success'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {b.published ? 'เผยแพร่' : 'ฉบับร่าง'}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={b.published ? 'ซ่อน' : 'เผยแพร่'}
                  disabled={pending}
                  onClick={() => run(() => toggleBannerAction(b.id, !b.published))}
                >
                  {b.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="แก้ไข"
                  onClick={() => setEditing(b.id)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="ลบ"
                  disabled={pending}
                  onClick={() => {
                    if (confirm(`ลบแบนเนอร์ "${b.title}"?`)) {
                      run(() => deleteBannerAction(b.id));
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
