'use client';

import { useActionState } from 'react';
import { resendVerification, type ResendState } from '@/app/actions/verify';

export default function ResendForm({ defaultEmail }: { defaultEmail: string }) {
  const [state, action, pending] = useActionState<ResendState, FormData>(resendVerification, undefined);

  return (
    <form action={action} className="space-y-3">
      <input
        type="email"
        name="email"
        defaultValue={defaultEmail}
        required
        placeholder="name@example.com"
        className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
      />
      {state?.message && (
        <p className={`text-sm text-center ${state.success ? 'text-green-700' : 'text-red-600'}`}>
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full border border-border rounded-lg py-2.5 text-sm font-medium hover:bg-primary-light/10 transition-colors disabled:opacity-60"
      >
        {pending ? 'Илгээж байна...' : 'Дахин илгээх'}
      </button>
    </form>
  );
}
