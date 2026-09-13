import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';

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

// Fetch an object's full bytes — for embedding (e.g. the résumé photo baked
// into resume-pdf.tsx via @react-pdf/renderer's <Image>), which needs the
// whole buffer up front rather than a stream. Throws if the key does not
// exist.
export async function getObjectBuffer(key: string): Promise<Uint8Array> {
  const res = await r2.send(
    new GetObjectCommand({Bucket: R2_BUCKET, Key: key}),
  );
  return res.Body!.transformToByteArray();
}

// Long enough for a slow mobile upload to actually start (the URL is only
// used once, right after it's issued); short enough that a leaked URL stops
// being useful quickly.
const PRESIGNED_UPLOAD_EXPIRY_SECONDS = 5 * 60;

// A short-lived URL the browser can PUT a file's bytes to directly — the
// bytes never pass through a Server Action's request body, so they are not
// bound by Netlify Functions' payload limit (#231's permanent fix; see
// document-actions.ts's requestDocumentUploadUrl). The PUT must send exactly
// this Content-Type header: R2 verifies it as part of the signature, so a
// mismatched header is rejected outright rather than silently accepted.
export async function createPresignedUploadUrl(
  key: string,
  contentType: string,
): Promise<string> {
  return getSignedUrl(
    r2,
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
    }),
    {expiresIn: PRESIGNED_UPLOAD_EXPIRY_SECONDS},
  );
}

// Metadata for an object without downloading its body. Used to authoritatively
// verify a direct-to-R2 upload (#231) actually landed and how big it really
// is — the app never sees the bytes on that path, unlike putObject's callers.
// Returns null if the key does not exist (e.g. the browser's PUT never
// actually completed, or was never attempted).
export async function getObjectMetadata(
  key: string,
): Promise<{size: number; contentType: string} | null> {
  try {
    const res = await r2.send(
      new HeadObjectCommand({Bucket: R2_BUCKET, Key: key}),
    );
    return {size: res.ContentLength ?? 0, contentType: res.ContentType ?? ''};
  } catch (e) {
    if (e instanceof Error && e.name === 'NotFound') return null;
    throw e;
  }
}

// Server-side copy within the bucket, then removes the source — used to
// promote a validated staging upload to its final, stable key (#231) without
// ever exposing the app to the object's bytes.
export async function moveObject(
  fromKey: string,
  toKey: string,
): Promise<void> {
  await r2.send(
    new CopyObjectCommand({
      Bucket: R2_BUCKET,
      Key: toKey,
      CopySource: `${R2_BUCKET}/${fromKey}`,
    }),
  );
  await deleteObject(fromKey);
}
