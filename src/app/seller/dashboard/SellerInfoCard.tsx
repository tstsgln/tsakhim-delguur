'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { updateSeller, type UpdateSellerState } from '@/app/actions/seller';

const LOCATIONS = ['Улаанбаатар', 'Дархан', 'Эрдэнэт', 'Бусад'];

interface Props {
  seller: {
    store_name: string;
    phone: string;
    location: string;
    description: string | null;
  };
}

export default function SellerInfoCard({ seller }: Props) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState<UpdateSellerState, FormData>(updateSeller, undefined);
  const errors = state?.errors;

  useEffect(() => {
    if (state?.success) {
      setEditing(false);
    }
  }, [state]);

  return (
    <div className="bg-surface border border-border rounded-xl p-6 mb-8">
      {editing ? (
        <form action={action} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Дэлгүүрийн нэр</label>
            <input
              name="storeName"
              type="text"
              defaultValue={seller.store_name}
              className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
            />
            {errors?.storeName?.[0] && <p className="text-xs text-red-600 mt-1">{errors.storeName[0]}</p>}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Утасны дугаар</label>
              <input
                name="phone"
                type="tel"
                defaultValue={seller.phone}
                className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
              />
              {errors?.phone?.[0] && <p className="text-xs text-red-600 mt-1">{errors.phone[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Байршил</label>
              <select
                name="location"
                defaultValue={seller.location}
                className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary bg-surface"
              >
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              {errors?.location?.[0] && <p className="text-xs text-red-600 mt-1">{errors.location[0]}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Нэмэлт мэдээлэл</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={seller.description ?? ''}
              placeholder="Дэлгүүрийн тухай товч тайлбар..."
              className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary resize-none"
            />
          </div>
          {state?.message && <p className="text-sm text-red-600">{state.message}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {pending ? 'Хадгалж байна...' : 'Хадгалах'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="bg-surface border border-border px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-light/20 transition-colors"
            >
              Болих
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{seller.store_name}</h1>
            <p className="text-sm text-muted mt-1">
              📍 {seller.location} · 📞 {seller.phone}
            </p>
            {seller.description && (
              <p className="text-sm text-muted mt-2 max-w-2xl">{seller.description}</p>
            )}
          </div>
          <div className="flex gap-2 self-start">
            <button
              onClick={() => setEditing(true)}
              className="bg-surface border border-border px-4 py-2.5 rounded-lg font-medium hover:bg-primary-light/20 transition-colors text-sm"
            >
              ✏️ Засах
            </button>
            <Link
              href="/seller/products/new"
              className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition-colors text-sm"
            >
              + Бараа нэмэх
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
