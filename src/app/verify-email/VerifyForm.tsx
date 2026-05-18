'use client';

import { useActionState } from 'react';
import { verifyEmail, type VerifyState } from '@/app/actions/verify';

export default function VerifyForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<VerifyState, FormData>(verifyEmail, undefined);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state?.message && (
        <p className="text-sm text-red-600 text-center">{state.message}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
      >
        {pending ? 'Түр хүлээнэ үү...' : 'Имэйл баталгаажуулах'}
      </button>
    </form>
  );
}
