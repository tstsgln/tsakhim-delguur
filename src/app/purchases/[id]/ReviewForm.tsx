'use client';

import { useActionState, useState } from 'react';
import { submitReview, type ReviewState } from '@/app/actions/reviews';

interface Props {
  orderItemId: number;
}

export default function ReviewForm({ orderItemId }: Props) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(submitReview, undefined);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  if (state?.success) {
    return (
      <p className="text-xs text-success mt-2">✓ Үнэлгээ илгээгдлээ. Баярлалаа!</p>
    );
  }

  return (
    <form action={action} className="mt-3 bg-primary-light/10 border border-border rounded-lg p-3">
      <input type="hidden" name="orderItemId" value={orderItemId} />
      <input type="hidden" name="rating" value={rating} />
      <p className="text-xs font-medium mb-2">Үнэлгээ өгөх:</p>
      <div className="flex items-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map(n => {
          const filled = (hover || rating) >= n;
          return (
            <button
              type="button"
              key={n}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className={`text-2xl leading-none ${filled ? 'text-warning' : 'text-border'} hover:scale-110 transition-transform`}
              aria-label={`${n} од`}
            >
              ★
            </button>
          );
        })}
        {rating > 0 && <span className="ml-2 text-xs text-muted">{rating}/5</span>}
      </div>
      <textarea
        name="comment"
        rows={2}
        maxLength={2000}
        placeholder="Сэтгэгдэл (заавал биш)"
        className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface"
      />
      {state?.errors?.form?.[0] && (
        <p className="text-xs text-red-600 mt-1">{state.errors.form[0]}</p>
      )}
      {state?.errors?.rating?.[0] && (
        <p className="text-xs text-red-600 mt-1">{state.errors.rating[0]}</p>
      )}
      <button
        type="submit"
        disabled={pending || rating === 0}
        className="mt-2 bg-primary text-white text-sm px-4 py-1.5 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? 'Илгээж байна...' : 'Үнэлгээ илгээх'}
      </button>
    </form>
  );
}
