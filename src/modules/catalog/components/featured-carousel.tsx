'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatThb } from '@/lib/money';
import { productImageUrl } from '@/lib/supabase/storage';
import type { ProductListItem } from '../types';

/**
 * Featured-products carousel. Native scroll-snap track (real swipe on touch),
 * auto-advances every 6s but pauses on hover/focus and never autoplays under
 * prefers-reduced-motion. Prev/next + dots are layered on top.
 */
export function FeaturedCarousel({ products }: { products: ProductListItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = products.length;

  const scrollTo = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;
      const idx = ((i % count) + count) % count;
      const slide = track.children[idx] as HTMLElement | undefined;
      slide?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    },
    [count],
  );

  // Reflect the scroll position back into the active dot.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const i = Math.round(track.scrollLeft / track.clientWidth);
        setActive(Math.max(0, Math.min(count - 1, i)));
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [count]);

  // Autoplay — disabled when paused, single slide, or reduced-motion.
  useEffect(() => {
    if (count <= 1 || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => scrollTo(active + 1), 6000);
    return () => window.clearInterval(id);
  }, [active, count, paused, scrollTo]);

  if (count === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="พระเครื่องแนะนำ"
      className="group/carousel relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-2xl"
      >
        {products.map((product, i) => {
          const soldOut = product.status === 'SOLD_OUT' || product.stock <= 0;
          return (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} จาก ${count}: ${product.title}`}
              className="relative block min-w-full snap-start focus-visible:outline-none"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-secondary to-muted sm:aspect-[16/9] lg:aspect-[21/9]">
                {product.imagePath ? (
                  <Image
                    src={productImageUrl(product.imagePath)}
                    alt={product.title}
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    className="object-cover transition-transform duration-700 group-hover/carousel:scale-[1.03]"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center text-7xl font-bold text-primary/25"
                  >
                    พระ
                  </span>
                )}
                {/* Legibility scrim for the overlaid copy. */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-12">
                  <div className="max-w-xl">
                    <span className="inline-block rounded-full bg-footer-accent/90 px-3 py-1 text-xs font-medium text-footer">
                      พระเครื่องแนะนำ
                    </span>
                    <h3 className="mt-3 font-display text-2xl font-semibold text-white drop-shadow-sm sm:text-3xl lg:text-4xl">
                      {product.title}
                    </h3>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-lg font-semibold tabular-nums text-footer-accent">
                        {formatThb(product.price)}
                      </span>
                      {soldOut && (
                        <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                          หมดแล้ว
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="สไลด์ก่อนหน้า"
            onClick={() => scrollTo(active - 1)}
            className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-sm transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="สไลด์ถัดไป"
            onClick={() => scrollTo(active + 1)}
            className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-sm transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
            {products.map((product, i) => (
              <button
                key={product.id}
                type="button"
                aria-label={`ไปสไลด์ที่ ${i + 1}`}
                aria-current={i === active}
                onClick={() => scrollTo(i)}
                className={cn(
                  'h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  i === active ? 'w-6 bg-footer-accent' : 'w-2 bg-white/60 hover:bg-white',
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
