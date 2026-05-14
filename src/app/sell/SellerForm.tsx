'use client';

import { useActionState } from 'react';
import { becomeSeller, type SellerState } from '@/app/actions/seller';

const LOCATIONS = ['Улаанбаатар', 'Дархан', 'Эрдэнэт', 'Бусад'];

export default function SellerForm() {
  const [state, action, pending] = useActionState<SellerState, FormData>(becomeSeller, undefined);
  const errors = state?.errors;

  return (
    <form action={action} className="bg-surface border border-border rounded-xl p-6 space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Овог</label>
          <input
            name="lastName"
            type="text"
            placeholder="Овог"
            className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
          />
          {errors?.lastName?.[0] && <p className="text-xs text-red-600 mt-1">{errors.lastName[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Нэр</label>
          <input
            name="firstName"
            type="text"
            placeholder="Нэр"
            className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
          />
          {errors?.firstName?.[0] && <p className="text-xs text-red-600 mt-1">{errors.firstName[0]}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Дэлгүүрийн нэр</label>
        <input
          name="storeName"
          type="text"
          placeholder="Таны дэлгүүрийн нэр"
          className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
        />
        {errors?.storeName?.[0] && <p className="text-xs text-red-600 mt-1">{errors.storeName[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Утасны дугаар</label>
        <input
          name="phone"
          type="tel"
          placeholder="+976 0000-0000"
          className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
        />
        {errors?.phone?.[0] && <p className="text-xs text-red-600 mt-1">{errors.phone[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Байршил</label>
        <select
          name="location"
          defaultValue={LOCATIONS[0]}
          className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary bg-surface"
        >
          {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        {errors?.location?.[0] && <p className="text-xs text-red-600 mt-1">{errors.location[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Нэмэлт мэдээлэл</label>
        <textarea
          name="description"
          rows={3}
          placeholder="Өөрийн бүтээгдэхүүний талаар товч тайлбарлана уу..."
          className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary resize-none"
        />
      </div>

      <label className="flex items-start gap-2 text-sm cursor-pointer">
        <input name="agreed" type="checkbox" className="accent-primary mt-1" />
        <span className="text-muted">Үйлчилгээний нөхцөлийг зөвшөөрч байна</span>
      </label>
      {errors?.agreed?.[0] && <p className="text-xs text-red-600">{errors.agreed[0]}</p>}

      {state?.message && <p className="text-sm text-red-600 text-center">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
      >
        {pending ? 'Илгээж байна...' : 'Бүртгүүлэх'}
      </button>
    </form>
  );
}
