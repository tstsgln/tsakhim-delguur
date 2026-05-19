'use client';

import { useActionState } from 'react';
import { deleteAccount, type DeleteAccountState } from '@/app/actions/auth';

export default function DeleteAccountForm({ userEmail }: { userEmail: string }) {
  const [state, action, pending] = useActionState<DeleteAccountState, FormData>(
    deleteAccount,
    undefined,
  );

  return (
    <form action={action} className="bg-surface border border-border rounded-xl p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Имэйл</label>
        <input
          type="email"
          value={userEmail}
          disabled
          className="w-full border border-border rounded-lg px-4 py-2.5 bg-primary-light/10 text-muted"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Нууц үг</label>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
        />
        {state?.errors?.password?.[0] && (
          <p className="text-xs text-red-600 mt-1">{state.errors.password[0]}</p>
        )}
      </div>

      {state?.message && <p className="text-sm text-red-600 text-center">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
      >
        {pending ? 'Устгаж байна...' : 'Бүртгэлээ бүрмөсөн устгах'}
      </button>
    </form>
  );
}
