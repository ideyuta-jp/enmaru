import {S3Client} from '@aws-sdk/client-s3';

// Cloudflare R2 is S3-compatible. The region is always "auto" and the endpoint
// points at the account's R2 gateway. Credentials are an R2 API token
// (access key id / secret). Local dev uses a dev bucket; production values are
// set in Vercel env vars. Cached on globalThis to avoid creating a new client
// on every hot reload in development (mirrors src/lib/prisma.ts).
const globalForR2 = globalThis as unknown as {r2?: S3Client};

export const r2 =
  globalForR2.r2 ??
  new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID ?? ''}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForR2.r2 = r2;
}

export const R2_BUCKET = process.env.R2_BUCKET ?? '';
