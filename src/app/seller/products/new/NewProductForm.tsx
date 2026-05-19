'use client';

import { useActionState, useState } from 'react';
import Image from 'next/image';
import { createProduct, type ProductState } from '@/app/actions/seller';

interface Props {
  categories: { id: string; name: string }[];
}

export default function NewProductForm({ categories }: Props) {
  const [state, action, pending] = useActionState<ProductState, FormData>(createProduct, undefined);
  const [previews, setPreviews] = useState<string[]>([]);
  const errors = state?.errors;

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    previews.forEach(URL.revokeObjectURL);
    const files = Array.from(e.target.files ?? []);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  return (
    <form action={action} className="bg-surface border border-border rounded-xl p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Бүтээгдэхүүний нэр</label>
        <input
          name="name"
          type="text"
          placeholder="Жишээ нь: Гар хийцийн морин хуур"
          className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
        />
        {errors?.name?.[0] && <p className="text-xs text-red-600 mt-1">{errors.name[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Тайлбар</label>
        <textarea
          name="description"
          rows={5}
          placeholder="Хэрэглэгчид мэдэх ёстой бүх зүйлийг бичээрэй (хэмжээ, материал, гарал үүсэл гэх мэт)..."
          className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary resize-none"
        />
        {errors?.description?.[0] && <p className="text-xs text-red-600 mt-1">{errors.description[0]}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Үнэ (₮)</label>
          <input
            name="price"
            type="number"
            min={1}
            step={1}
            placeholder="0"
            className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
          />
          {errors?.price?.[0] && <p className="text-xs text-red-600 mt-1">{errors.price[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ангилал</label>
          <select
            name="category"
            defaultValue={categories[0]?.id}
            className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary bg-surface"
          >
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors?.category?.[0] && <p className="text-xs text-red-600 mt-1">{errors.category[0]}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Үлдэгдэл (ширхэг)</label>
        <input
          name="stockQuantity"
          type="number"
          min={0}
          step={1}
          defaultValue={1}
          className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
        />
        <p className="text-xs text-muted mt-1">Бэлэн байгаа барааны тоо. Дууссан үед худалдан авагч сагсанд нэмэх боломжгүй.</p>
        {errors?.stockQuantity?.[0] && <p className="text-xs text-red-600 mt-1">{errors.stockQuantity[0]}</p>}
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          name="acceptCustomOrders"
          type="checkbox"
          value="on"
          className="mt-0.5 accent-primary w-4 h-4"
        />
        <span className="text-sm">
          <span className="font-medium">Дууссан үед нэмэлт захиалга авна</span>
          <span className="block text-xs text-muted mt-0.5">
            Үлдэгдэл 0 болсон үед худалдан авагч таныг шууд захиалга өгөх боломжтой
            (зурвасаар тохиролцоно).
          </span>
        </span>
      </label>

      <div>
        <label className="block text-sm font-medium mb-1">Зургууд</label>
        <input
          name="images"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFiles}
          className="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-light/30 file:text-primary hover:file:bg-primary-light/50"
        />
        <p className="text-xs text-muted mt-1">JPG, PNG, WEBP, GIF. Тус бүр 5MB-аас бага.</p>
        {errors?.images?.[0] && <p className="text-xs text-red-600 mt-1">{errors.images[0]}</p>}

        {previews.length > 0 && (
          <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
            {previews.map((src, i) => (
              <div key={i} className="aspect-square relative rounded-lg overflow-hidden border border-border">
                <Image src={src} alt={`Preview ${i + 1}`} fill sizes="20vw" className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        )}
      </div>

      {state?.message && <p className="text-sm text-red-600 text-center">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
      >
        {pending ? 'Хадгалж байна...' : 'Бараа нэмэх'}
      </button>
    </form>
  );
}
