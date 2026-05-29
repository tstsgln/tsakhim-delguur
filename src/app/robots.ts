import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private / authenticated areas — no value to search engines.
      disallow: [
        '/admin',
        '/api/',
        '/balance',
        '/cart',
        '/purchases',
        '/messages',
        '/notifications',
        '/seller',
        '/settings',
        '/login',
        '/signup',
        '/verify-email',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
