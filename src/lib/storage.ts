import {DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client} from '@aws-sdk/client-s3';

// Cloudflare R2 is S3-compatible. The region is always "auto" and the endpoint
// points at the account's R2 gateway. Credentials are an R2 API token
// (access key id / secret). Local dev uses a dev bucket; production values are
// set as Netlify env vars. Cached on globalThis to avoid creating a new client
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

// Store an object (overwrites any existing object at the same key).
export async function putObject(
  key: string,
  body: Uint8Array,
  contentType: string,
): Promise<void> {
  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

// Remove an object. No-ops silently if the key does not exist.
export async function deleteObject(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({Bucket: R2_BUCKET, Key: key}));
}

// Fetch an object as a web ReadableStream plus its content type, for streaming
// back through a route handler. Throws if the key does not exist.
export async function getObjectStream(
  key: string,
): Promise<{body: ReadableStream; contentType: string}> {
  const res = await r2.send(
    new GetObjectCommand({Bucket: R2_BUCKET, Key: key}),
  );
  return {
    body: res.Body!.transformToWebStream(),
    contentType: res.ContentType ?? 'application/octet-stream',
  };
}
