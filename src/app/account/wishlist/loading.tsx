import { Skeleton } from '@/components/ui/skeleton';
import { ProductGridSkeleton } from '@/modules/catalog/components/product-card-skeleton';

export default function Loading() {
  return (
    <div className="container py-10">
      <Skeleton className="h-8 w-40" />
      <div className="mt-6">
        <ProductGridSkeleton count={4} />
      </div>
    </div>
  );
}
