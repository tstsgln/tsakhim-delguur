import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { getSitemapProducts, getSitemapStores } from '@/lib/products-db';

function parseDate(raw: string): Date {
  const d = new Date(raw.includes('Z') || raw.includes('T') ? raw : raw + 'Z');
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const products: MetadataRoute.Sitemap = getSitemapProducts().map(p => ({
    url: `${SITE_URL}/product/${p.id}`,
    lastModified: parseDate(p.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const stores: MetadataRoute.Sitemap = getSitemapStores().map(s => ({
    url: `${SITE_URL}/store/${s.id}`,
    lastModified: parseDate(s.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...products, ...stores];
}
