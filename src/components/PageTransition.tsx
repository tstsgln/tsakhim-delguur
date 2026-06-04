'use client';

import { usePathname } from 'next/navigation';

/**
 * Replays a short fade-in whenever the route changes. Keying the wrapper on the
 * pathname remounts the subtree on navigation, which restarts the CSS animation.
 * Server-rendered children pass straight through.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}
