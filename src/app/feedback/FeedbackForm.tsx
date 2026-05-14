'use client';

import { useActionState } from 'react';
import { submitFeedback, type FeedbackState } from '@/app/actions/feedback';

export default function FeedbackForm() {
  const [state, action, pending] = useActionState<FeedbackState, FormData>(submitFeedback, undefined);
  const errors = state?.errors;

  if (state?.success) {
    return (
      <div className="bg-surface border border-border rounded-xl p-8 text-center">
        <p className="text-5xl mb-3">🙏</p>
        <h2 className="text-xl font-bold mb-2">Илгээлээ. Баярлалаа!</h2>
        <p className="text-sm text-muted">Таны санал, гомдол биднийг илүү сайжруулахад тусална.</p>
      </div>
    );
  }

  return (
    <form action={action} className="bg-surface border border-border rounded-xl p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Төрөл</label>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 cursor-pointer flex-1 border border-border rounded-lg px-4 py-2.5 hover:bg-primary-light/10 transition-colors">
            <input type="radio" name="kind" value="suggestion" defaultChecked className="accent-primary" />
            <span className="text-sm">💡 Санал</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer flex-1 border border-border rounded-lg px-4 py-2.5 hover:bg-primary-light/10 transition-colors">
            <input type="radio" name="kind" value="complaint" className="accent-primary" />
            <span className="text-sm">⚠️ Гомдол</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Гарчиг (заавал биш)</label>
        <input
          name="subject"
          type="text"
          placeholder="Жишээ нь: Хүргэлтийн алдаа"
          maxLength={200}
          className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
        />
        {errors?.subject?.[0] && <p className="text-xs text-red-600 mt-1">{errors.subject[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Дэлгэрэнгүй</label>
        <textarea
          name="body"
          rows={6}
          placeholder="Юу болсон, эсвэл та юу санал болгож байна?"
          className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary resize-none"
          required
        />
        {errors?.body?.[0] && <p className="text-xs text-red-600 mt-1">{errors.body[0]}</p>}
      </div>

      {state?.message && <p className="text-sm text-red-600 text-center">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
      >
        {pending ? 'Илгээж байна...' : 'Илгээх'}
      </button>
    </form>
  );
}
