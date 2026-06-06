'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { productImageUrl } from '@/lib/supabase/storage';
import type { ProductImageItem } from '../types';

export function ProductGallery({
  images,
  title,
}: {
  images: ProductImageItem[];
  title: string;
}) {
  const [active, setActive] = React.useState(0);

  if (images.length === 0) {
    return (
      <div
        className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-secondary to-muted"
        aria-hidden="true"
      >
        <span className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-primary/30">
          พระ
        </span>
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        <Image
          src={productImageUrl(images[active].path)}
          alt={images[active].alt || title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((img, i) => (
            <button
              key={img.path}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`รูปที่ ${i + 1}`}
              className={cn(
                'relative h-16 w-16 overflow-hidden rounded-md border',
                i === active ? 'ring-2 ring-primary' : '',
              )}
            >
              <Image
                src={productImageUrl(img.path)}
                alt={img.alt || `${title} ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
