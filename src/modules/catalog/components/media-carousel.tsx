'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { productImageUrl } from '@/lib/supabase/storage';

export interface CarouselSlide {
  id: string;
  /** Optional click target. When absent, the slide is not a link. */
  href?: string;
  imagePath: string | null;
  title: string;
  /** Small pill above the title (e.g. "พระเครื่องแนะนำ"). */
  badge?: string;
  /** Gold-emphasis line, e.g. a price. */
  price?: string;
  /** Muted secondary line, e.g. ad copy. */
  subtitle?: string;
}

/**
 * Generic full-width media carousel (product spotlights or ad slides). Native
 * scroll-snap track (real swipe), autoplays every 6s but pauses on hover/focus,
 * backgrounded tabs, and prefers-reduced-motion.
 */
export function MediaCarousel({
  slides,
  ariaLabel = 'สไลด์',
}: {
  slides: CarouselSlide[];
  ariaLabel?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

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

  useEffect(() => {
    if (count <= 1 || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      if (!document.hidden) scrollTo(active + 1);
    }, 6000);
    return () => window.clearInterval(id);
  }, [active, count, paused, scrollTo]);

  if (count === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={ariaLabel}
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
        {slides.map((slide, i) => {
          const inner = (
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-secondary to-muted sm:aspect-[16/9] lg:aspect-[21/9]">
              {slide.imagePath ? (
                <Image
                  src={productImageUrl(slide.imagePath)}
                  alt={slide.title}
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-12">
                <div className="max-w-xl">
                  {slide.badge && (
                    <span className="inline-block rounded-full bg-footer-accent/90 px-3 py-1 text-xs font-medium text-footer">
                      {slide.badge}
                    </span>
                  )}
                  <h3 className="mt-3 font-display text-2xl font-semibold text-white drop-shadow-sm sm:text-3xl lg:text-4xl">
                    {slide.title}
                  </h3>
                  {slide.price && (
                    <p className="mt-3 text-lg font-semibold tabular-nums text-footer-accent">
                      {slide.price}
                    </p>
                  )}
                  {slide.subtitle && (
                    <p className="mt-2 max-w-lg text-pretty text-white/85">{slide.subtitle}</p>
                  )}
                </div>
              </div>
            </div>
          );

          const common = {
            role: 'group',
            'aria-roledescription': 'slide',
            'aria-label': `${i + 1} จาก ${count}: ${slide.title}`,
            className: 'relative block min-w-full snap-start focus-visible:outline-none',
          } as const;

          return slide.href ? (
            <Link key={slide.id} href={slide.href} {...common}>
              {inner}
            </Link>
          ) : (
            <div key={slide.id} {...common}>
              {inner}
            </div>
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
            {slides.map((slide, i) => (
              <button
                key={slide.id}
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
