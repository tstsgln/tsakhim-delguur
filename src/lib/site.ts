// Canonical public origin for the site. Used for metadata, sitemap, robots, OG tags.
// Override per-environment with NEXT_PUBLIC_SITE_URL if needed.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tsetseglen.mn'
).replace(/\/$/, '');

export const SITE_NAME = 'Цэцэглэн';
