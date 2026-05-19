'use client';

import { useActionState } from 'react';
import { requestPayoutAction, type PayoutState } from '@/app/actions/orders';
import { formatPrice } from '@/lib/data';

const BANK_OPTIONS = [
  'Хаан банк',
  'Худалдаа хөгжлийн банк',
  'Голомт банк',
  'Төрийн банк',
  'Хас банк',
  'Капитрон банк',
  'Чингис хаан банк',
  'Үндэсний хөрөнгө оруулалтын банк',
  'Богд банк',
  'Ариг банк',
];

export default function PayoutForm({ maxAmount, userName }: { maxAmount: number; userName: string }) {
  const [state, action, pending] = useActionState<PayoutState, FormData>(
    requestPayoutAction,
    undefined,
  );

  if (state?.success) {
    return (
      <div className="text-center py-4">
        <p className="text-3xl mb-2">✓</p>
        <p className="text-sm font-medium">Татан авах хүсэлт илгээгдлээ</p>
        <p className="text-xs text-muted mt-1">Манай админ 1-2 ажлын өдрийн дотор шилжүүлнэ.</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="block text-xs font-medium mb-1">Дүн (хамгийн ихдээ {formatPrice(maxAmount)})</label>
        <input
          name="amount"
          type="number"
          min={1}
          max={maxAmount}
          required
          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
        />
        {state?.errors?.amount?.[0] && <p className="text-xs text-red-600 mt-1">{state.errors.amount[0]}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Банк</label>
        <select
          name="bankName"
          required
          defaultValue=""
          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
        >
          <option value="" disabled>
            -- Сонгох --
          </option>
          {BANK_OPTIONS.map(b => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        {state?.errors?.bankName?.[0] && <p className="text-xs text-red-600 mt-1">{state.errors.bankName[0]}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Дансны дугаар</label>
        <input
          name="accountNumber"
          type="text"
          required
          inputMode="numeric"
          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
        />
        {state?.errors?.accountNumber?.[0] && (
          <p className="text-xs text-red-600 mt-1">{state.errors.accountNumber[0]}</p>
        )}
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Эзэмшигчийн нэр</label>
        <input
          name="accountHolder"
          type="text"
          required
          defaultValue={userName}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
        />
        {state?.errors?.accountHolder?.[0] && (
          <p className="text-xs text-red-600 mt-1">{state.errors.accountHolder[0]}</p>
        )}
      </div>
      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
      >
        {pending ? 'Илгээж байна...' : 'Татан авах хүсэлт илгээх'}
      </button>
    </form>
  );
}
