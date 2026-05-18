'use client';

import { useActionState } from 'react';
import { resendVerification, type ResendState } from '@/app/actions/verify';

export default function UnverifiedBanner({ email }: { email: string }) {
  const [state, action, pending] = useActionState<ResendState, FormData>(resendVerification, undefined);

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p>
          ⚠️ Имэйл хаягаа баталгаажуулна уу. Бүх боломжийг ашиглахын тулд{' '}
          <span className="font-medium">{email}</span> хаяг руу явуулсан холбоосыг дарна уу.
        </p>
        <form action={action} className="flex items-center gap-2">
          <input type="hidden" name="email" value={email} />
          <button
            type="submit"
            disabled={pending}
            className="border border-amber-400 text-amber-900 rounded-md px-3 py-1 text-xs font-medium hover:bg-amber-100 transition-colors disabled:opacity-60"
          >
            {pending ? 'Илгээж байна...' : 'Дахин илгээх'}
          </button>
          {state?.message && (
            <span className={`text-xs ${state.success ? 'text-green-700' : 'text-red-600'}`}>
              {state.message}
            </span>
          )}
        </form>
      </div>
    </div>
  );
}
