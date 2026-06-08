import { AdminHelp, ReviewPreview } from '@/modules/admin/components/admin-help';
import { listPendingReviews } from '@/modules/reviews/repository';
import { Stars } from '@/modules/reviews/components/stars';
import { ModerationActions } from '@/modules/reviews/components/moderation-actions';

export default async function AdminReviewsPage() {
  const reviews = await listPendingReviews();
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">รีวิวที่รออนุมัติ</h1>
      <div className="mt-6">
        <AdminHelp
          what="อนุมัติหรือปฏิเสธรีวิวจากลูกค้า (รีวิวต้องมาจากผู้ที่ซื้อจริง) เมื่ออนุมัติ รีวิวจะแสดงใต้สินค้าและนับรวมเป็นคะแนนเฉลี่ย"
          preview={<ReviewPreview />}
        />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{reviews.length} รายการ</p>

      {reviews.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">ไม่มีรีวิวที่รออนุมัติ 🎉</p>
      ) : (
        <ul className="mt-6 divide-y rounded-lg border">
          {reviews.map((r) => (
            <li key={r.id} className="flex flex-wrap items-start justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{r.productTitle}</p>
                <Stars value={r.rating} className="my-1" />
                {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
              </div>
              <ModerationActions reviewId={r.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
