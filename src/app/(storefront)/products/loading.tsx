import { Skeleton } from '@/components/ui/skeleton';
import { ProductGridSkeleton } from '@/modules/catalog/components/product-card-skeleton';

export default function Loading() {
  return (
    <div className="container py-10">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-2 h-4 w-32" />
      <div className="mt-6">
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
