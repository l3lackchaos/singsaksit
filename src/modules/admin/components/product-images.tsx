'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, UploadCloud } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { productImageUrl } from '@/lib/supabase/storage';
import { addProductImageAction, deleteProductImageAction } from '@/modules/admin/actions';
import { Button } from '@/components/ui/button';

interface ImageRow {
  id: string;
  storagePath: string;
  alt: string;
}

export function ProductImages({
  productId,
  images,
}: {
  productId: string;
  images: ImageRow[];
}) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    startTransition(async () => {
      const sb = createSupabaseBrowserClient();
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${productId}/${Date.now()}.${ext}`;
      const { error: upErr } = await sb.storage.from('products').upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (upErr) {
        setError('อัปโหลดรูปไม่สำเร็จ');
        return;
      }
      const res = await addProductImageAction(productId, path, file.name);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm font-medium">รูปสินค้า</p>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-3">
        {images.map((img) => (
          <div key={img.id} className="relative h-24 w-24 overflow-hidden rounded-md border">
            <Image
              src={productImageUrl(img.storagePath)}
              alt={img.alt}
              fill
              sizes="96px"
              className="object-cover"
            />
            <button
              type="button"
              aria-label="ลบรูป"
              className="absolute right-1 top-1 rounded bg-background/80 p-1 text-destructive"
              onClick={() =>
                startTransition(async () => {
                  await deleteProductImageAction(img.id, productId, img.storagePath);
                  router.refresh();
                })
              }
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <label className="mt-3 inline-flex">
        <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={pending} />
        <Button type="button" variant="outline" size="sm" asChild>
          <span>
            <UploadCloud className="h-4 w-4" /> {pending ? 'กำลังอัปโหลด…' : 'อัปโหลดรูป'}
          </span>
        </Button>
      </label>
    </div>
  );
}
