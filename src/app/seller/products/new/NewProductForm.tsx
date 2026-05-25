'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createProduct, type ProductState } from '@/app/actions/seller';

interface Props {
  categories: { id: string; name: string }[];
  storeId: number;
}

interface SelectedFile {
  file: File;
  preview: string;
}

export default function NewProductForm({ categories, storeId }: Props) {
  const [state, action, pending] = useActionState<ProductState, FormData>(createProduct, undefined);
  const [selected, setSelected] = useState<SelectedFile[]>([]);
  const lastSuccessId = useRef<number | null>(null);
  const errors = state?.success ? undefined : state?.errors;
  const values = state?.success ? undefined : state?.values;
  const formKey = state?.success ? `success-${state.submitId}` : state?.submitId ?? 'initial';

  useEffect(() => {
    if (state?.success && state.submitId && lastSuccessId.current !== state.submitId) {
      lastSuccessId.current = state.submitId;
      setSelected(prev => {
        prev.forEach(s => URL.revokeObjectURL(s.preview));
        return [];
      });
    }
  }, [state?.success, state?.submitId]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    selected.forEach(s => URL.revokeObjectURL(s.preview));
    const files = Array.from(e.target.files ?? []);
    setSelected(files.map(f => ({ file: f, preview: URL.createObjectURL(f) })));
  };

  const removeFile = (idx: number) => {
    setSelected(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.delete('images');
    for (const s of selected) fd.append('images', s.file);
    action(fd);
  };

  return (
    <div className="space-y-4">
      {state?.success && state.createdProductName && (
        <div className="bg-success/10 border border-success/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm">
            <p className="font-semibold text-success">✓ «{state.createdProductName}» амжилттай нэмэгдлээ</p>
            <p className="text-xs text-muted mt-0.5">Доорх формоор шууд дараагийн бараагаа нэмэх боломжтой.</p>
          </div>
          <div className="flex gap-2">
            {state.createdProductId && (
              <Link
                href={`/product/${state.createdProductId}`}
                className="text-xs bg-surface border border-border px-3 py-1.5 rounded-md hover:bg-primary-light/20"
              >
                Үзэх
              </Link>
            )}
            <Link
              href="/seller/dashboard"
              className="text-xs bg-surface border border-border px-3 py-1.5 rounded-md hover:bg-primary-light/20"
            >
              Дэлгүүр рүү
            </Link>
          </div>
        </div>
      )}
    <form
      key={formKey}
      onSubmit={handleSubmit}
      className="bg-surface border border-border rounded-xl p-6 space-y-4"
    >
      <input type="hidden" name="storeId" value={storeId} />
      <div>
        <label className="block text-sm font-medium mb-1">Бүтээгдэхүүний нэр</label>
        <input
          name="name"
          type="text"
          placeholder="Жишээ нь: Гар хийцийн морин хуур"
          defaultValue={values?.name ?? ''}
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
          defaultValue={values?.description ?? ''}
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
            defaultValue={values?.price ?? ''}
            className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
          />
          {errors?.price?.[0] && <p className="text-xs text-red-600 mt-1">{errors.price[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ангилал</label>
          <select
            name="category"
            defaultValue={values?.category ?? categories[0]?.id}
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
          defaultValue={values?.stockQuantity ?? '1'}
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
          defaultChecked={values?.acceptCustomOrders ?? false}
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
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFiles}
          className="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-light/30 file:text-primary hover:file:bg-primary-light/50"
        />
        <p className="text-xs text-muted mt-1">
          JPG, PNG, WEBP, GIF. Тус бүр 5MB-аас бага.
          {selected.length > 0 && (
            <span className="ml-1 text-foreground font-medium">
              · {selected.length} зураг сонгосон
            </span>
          )}
        </p>
        {errors?.images?.[0] && <p className="text-xs text-red-600 mt-1">{errors.images[0]}</p>}

        {selected.length > 0 && (
          <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
            {selected.map((s, i) => (
              <div key={i} className="aspect-square relative rounded-lg overflow-hidden border border-border group">
                <Image src={s.preview} alt={`Preview ${i + 1}`} fill sizes="20vw" className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full text-xs leading-none flex items-center justify-center hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Устгах"
                >
                  ✕
                </button>
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
    </div>
  );
}
