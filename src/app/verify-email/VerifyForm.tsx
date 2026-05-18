'use client';

import { useActionState, useEffect, useRef } from 'react';
import { verifyEmail, type VerifyState } from '@/app/actions/verify';

export default function VerifyForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<VerifyState, FormData>(verifyEmail, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    formRef.current?.requestSubmit();
  }, []);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state?.message ? (
        <>
          <p className="text-sm text-red-600 text-center">{state.message}</p>
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
          >
            {pending ? 'Дахин оролдож байна...' : 'Дахин оролдох'}
          </button>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-muted">Баталгаажуулж байна...</p>
          <noscript>
            <p className="text-sm mt-4">JavaScript идэвхгүй байна. Доорх товчийг даргана уу:</p>
            <button
              type="submit"
              className="mt-3 w-full bg-primary text-white py-3 rounded-lg font-semibold"
            >
              Имэйл баталгаажуулах
            </button>
          </noscript>
        </div>
      )}
    </form>
  );
}
