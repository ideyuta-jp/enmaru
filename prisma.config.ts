// Load env the same way Next.js does (.env, .env.local, .env.<NODE_ENV>, ...),
// so the Prisma CLI (migrate/studio) reads DATABASE_URL from .env.local where
// local dev points at the dev Neon branch. Next's own runtime loads these on
// its own; this is only for CLI invocations that run outside Next.
import {loadEnvConfig} from '@next/env';
import {defineConfig} from 'prisma/config';

loadEnvConfig(process.cwd());

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Prefer the direct (unpooled) endpoint when provided: `prisma migrate`
    // needs session features the Neon pooler doesn't support. Netlify sets
    // DATABASE_URL_UNPOOLED for the build-time `prisma migrate deploy` while
    // the runtime keeps the pooled DATABASE_URL (src/lib/prisma.ts). Local dev
    // sets only DATABASE_URL, which already points at the direct endpoint.
    url: process.env['DATABASE_URL_UNPOOLED'] ?? process.env['DATABASE_URL'],
  },
});
