'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitReviewAction, type ReviewState } from '../actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? 'กำลังส่ง…' : 'ส่งรีวิว'}
    </Button>
  );
}

export function ReviewForm({ productId }: { productId: string }) {
  const [state, action] = useActionState(submitReviewAction, {} as ReviewState);
  return (
    <form action={action} className="mt-4 grid gap-3 rounded-lg border p-4">
      <input type="hidden" name="productId" value={productId} />
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-success">{state.success}</p>}
      <div className="grid gap-1">
        <Label htmlFor="rating">ให้คะแนน</Label>
        <select
          id="rating"
          name="rating"
          defaultValue="5"
          className="h-10 w-32 rounded-md border border-input bg-background px-3 text-sm"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} ดาว
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1">
        <Label htmlFor="comment">ความคิดเห็น</Label>
        <textarea
          id="comment"
          name="comment"
          rows={3}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="บอกเล่าประสบการณ์ของคุณ…"
        />
      </div>
      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
