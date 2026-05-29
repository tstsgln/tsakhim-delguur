import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Each test file gets a fresh in-memory SQLite database (db.ts reads this).
    env: { SQLITE_DB_PATH: ':memory:' },
  },
  resolve: {
    alias: {
      // `server-only` throws when imported outside the Next.js server bundler;
      // stub it so server modules can be unit-tested under plain Node.
      'server-only': path.resolve(__dirname, 'test/server-only-stub.ts'),
    },
  },
});
