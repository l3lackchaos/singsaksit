import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn('inline-flex', className)} aria-label={`คะแนน ${value} จาก 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i <= Math.round(value)
              ? 'fill-warning text-warning'
              : 'text-muted-foreground/40',
          )}
        />
      ))}
    </span>
  );
}
