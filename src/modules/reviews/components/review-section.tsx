import Link from 'next/link';
import { listApprovedReviews, getRatingSummary } from '../repository';
import { Stars } from './stars';
import { ReviewForm } from './review-form';

export async function ReviewSection({
  productId,
  canReview,
}: {
  productId: string;
  canReview: boolean;
}) {
  const [reviews, summary] = await Promise.all([
    listApprovedReviews(productId),
    getRatingSummary(productId),
  ]);

  return (
    <section className="mt-12">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">รีวิวจากผู้ซื้อ</h2>
        {summary.count > 0 && (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Stars value={summary.avg} /> {summary.avg} ({summary.count})
          </span>
        )}
      </div>

      {canReview ? (
        <ReviewForm productId={productId} />
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          <Link href="/sign-in" className="text-primary underline">
            เข้าสู่ระบบ
          </Link>{' '}
          เพื่อรีวิว (เฉพาะผู้ที่ซื้อสินค้านี้แล้ว)
        </p>
      )}

      <ul className="mt-6 space-y-4">
        {reviews.length === 0 && (
          <li className="text-sm text-muted-foreground">ยังไม่มีรีวิว</li>
        )}
        {reviews.map((r) => (
          <li key={r.id} className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Stars value={r.rating} />
              <span className="text-xs text-muted-foreground">ผู้ซื้อที่ยืนยันแล้ว</span>
            </div>
            {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
