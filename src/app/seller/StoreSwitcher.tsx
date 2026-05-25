'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface StoreOption {
  id: number;
  storeName: string;
}

interface Props {
  stores: StoreOption[];
  activeId: number;
}

export default function StoreSwitcher({ stores, activeId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('store', value);
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xs text-muted uppercase tracking-wider flex-shrink-0">Дэлгүүр:</span>
        <select
          value={String(activeId)}
          onChange={e => onChange(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary min-w-0"
        >
          {stores.map(s => (
            <option key={s.id} value={s.id}>
              🏪 {s.storeName}
            </option>
          ))}
        </select>
      </div>
      <Link
        href="/sell"
        className="text-xs text-primary hover:underline whitespace-nowrap"
      >
        + Шинэ дэлгүүр нээх
      </Link>
    </div>
  );
}
