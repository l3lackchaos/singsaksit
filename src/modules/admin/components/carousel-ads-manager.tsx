'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, UploadCloud, ImagePlus } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { productImageUrl } from '@/lib/supabase/storage';
import { addCarouselAdAction, removeCarouselAdAction } from '@/modules/admin/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CarouselAd {
  id: string;
  imagePath: string;
  title: string;
  body: string;
  href: string;
}

export function CarouselAdsManager({ ads }: { ads: CarouselAd[] }) {
  const router = useRouter();
  const [imagePath, setImagePath] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [uploading, startUpload] = React.useTransition();
  const [pending, startTransition] = React.useTransition();

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    startUpload(async () => {
      const sb = createSupabaseBrowserClient();
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `ads/${Date.now()}.${ext}`;
      const { error: upErr } = await sb.storage.from('products').upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (upErr) {
        setError('อัปโหลดรูปไม่สำเร็จ');
        return;
      }
      setImagePath(path);
    });
  }

  async function onAdd(formData: FormData) {
    setError(null);
    formData.set('imagePath', imagePath);
    const res = await addCarouselAdAction({}, formData);
    if (res.error) {
      setError(res.error);
      return;
    }
    setImagePath('');
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Existing slides */}
      {ads.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ads.map((ad) => (
            <li key={ad.id} className="overflow-hidden rounded-lg border">
              <div className="relative aspect-[16/9] bg-muted">
                {ad.imagePath && (
                  <Image
                    src={productImageUrl(ad.imagePath)}
                    alt={ad.title}
                    fill
                    sizes="(max-width:1024px) 50vw, 320px"
                    className="object-cover"
                  />
                )}
                <button
                  type="button"
                  aria-label="ลบสไลด์"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await removeCarouselAdAction(ad.id);
                      router.refresh();
                    })
                  }
                  className="absolute right-2 top-2 rounded bg-background/80 p-1.5 text-destructive shadow-sm hover:bg-background"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="p-3">
                <p className="line-clamp-1 font-medium">{ad.title}</p>
                {ad.body && (
                  <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{ad.body}</p>
                )}
                {ad.href && (
                  <p className="mt-1 line-clamp-1 text-xs text-primary">{ad.href}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          ยังไม่มีสไลด์โฆษณา — เพิ่มด้านล่าง (หน้าแรกจะสุ่มสินค้ามาแสดงแทนจนกว่าจะเพิ่ม)
        </p>
      )}

      {/* Add new slide */}
      <form action={onAdd} className="grid max-w-xl gap-4 rounded-lg border p-4">
        <p className="text-sm font-medium">เพิ่มสไลด์ใหม่</p>
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="grid gap-2">
          <Label>รูปสไลด์ (แนะนำแนวนอน 16:9)</Label>
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded-md border bg-muted">
              {imagePath ? (
                <Image
                  src={productImageUrl(imagePath)}
                  alt="ตัวอย่างรูปสไลด์"
                  fill
                  sizes="144px"
                  className="object-cover"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <ImagePlus className="h-6 w-6" />
                </span>
              )}
            </div>
            <label className="inline-flex">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onUpload}
                disabled={uploading}
              />
              <Button type="button" variant="outline" size="sm" asChild>
                <span>
                  <UploadCloud className="h-4 w-4" />
                  {uploading ? 'กำลังอัปโหลด…' : 'อัปโหลดรูป'}
                </span>
              </Button>
            </label>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="ad-title">หัวข้อ</Label>
          <Input id="ad-title" name="title" required maxLength={120} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ad-body">คำอธิบาย (ไม่บังคับ)</Label>
          <Input id="ad-body" name="body" maxLength={200} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ad-href">ลิงก์เมื่อคลิก (ไม่บังคับ)</Label>
          <Input id="ad-href" name="href" maxLength={300} placeholder="/products หรือ /product/slug" />
        </div>

        <div>
          <Button type="submit" disabled={!imagePath || uploading}>
            เพิ่มสไลด์
          </Button>
        </div>
      </form>
    </div>
  );
}
