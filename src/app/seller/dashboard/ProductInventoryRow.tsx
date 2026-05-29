'use client';

import { useState, useTransition } from 'react';
import { updateProductInventory, setProductArchived } from '@/app/actions/seller';

interface Props {
  productId: number;
  stockQuantity: number;
  acceptCustomOrders: boolean;
  archived: boolean;
}

export default function ProductInventoryRow({ productId, stockQuantity, acceptCustomOrders, archived }: Props) {
  const [stock, setStock] = useState(stockQuantity);
  const [accept, setAccept] = useState(acceptCustomOrders);
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  const toggleArchived = () => {
    const fd = new FormData();
    fd.set('productId', String(productId));
    fd.set('archived', archived ? 'off' : 'on');
    startTransition(() => {
      setProductArchived(fd);
    });
  };

  const submitStock = (newStock: number) => {
    if (newStock < 0) return;
    setStock(newStock);
    const fd = new FormData();
    fd.set('productId', String(productId));
    fd.set('stockQuantity', String(newStock));
    startTransition(() => {
      updateProductInventory(fd);
    });
  };

  const submitAccept = (newAccept: boolean) => {
    setAccept(newAccept);
    const fd = new FormData();
    fd.set('productId', String(productId));
    fd.set('acceptCustomOrders', newAccept ? 'on' : 'off');
    startTransition(() => {
      updateProductInventory(fd);
    });
  };

  return (
    <div className="flex flex-col gap-2 sm:items-end sm:min-w-[240px]">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted">Үлдэгдэл:</span>
        {editing ? (
          <input
            type="number"
            min={0}
            value={stock}
            onChange={e => setStock(Number(e.target.value))}
            onBlur={() => {
              setEditing(false);
              if (stock !== stockQuantity) submitStock(stock);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            autoFocus
            className="w-20 border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:border-primary"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={`text-sm font-semibold px-2 py-0.5 rounded border border-transparent hover:border-border transition-colors ${
              stock === 0 ? 'text-red-600' : ''
            }`}
          >
            {stock} ширхэг
          </button>
        )}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => submitStock(stock - 1)}
            disabled={pending || stock <= 0}
            className="w-7 h-7 rounded-md border border-border hover:bg-primary-light/20 disabled:opacity-40 text-sm"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => submitStock(stock + 1)}
            disabled={pending}
            className="w-7 h-7 rounded-md border border-border hover:bg-primary-light/20 disabled:opacity-40 text-sm"
          >
            +
          </button>
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer text-xs">
        <input
          type="checkbox"
          checked={accept}
          onChange={e => submitAccept(e.target.checked)}
          disabled={pending}
          className="accent-primary w-4 h-4"
        />
        <span className={accept ? 'text-foreground' : 'text-muted'}>
          Дууссан үед нэмэлт захиалга авна
        </span>
      </label>

      <button
        type="button"
        onClick={toggleArchived}
        disabled={pending}
        className={`text-xs px-3 py-1 rounded-md border transition-colors disabled:opacity-40 ${
          archived
            ? 'border-primary text-primary hover:bg-primary-light/20'
            : 'border-border text-muted hover:bg-primary-light/20'
        }`}
      >
        {archived ? '♻️ Дэлгүүрт буцаах' : '🗄️ Архивлах'}
      </button>
    </div>
  );
}
