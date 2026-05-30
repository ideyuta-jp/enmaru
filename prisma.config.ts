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
    url: process.env['DATABASE_URL'],
  },
});
