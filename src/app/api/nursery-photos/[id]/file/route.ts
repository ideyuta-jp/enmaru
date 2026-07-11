import type {NextRequest} from 'next/server';

import {getAccessibleNurseryPhotoFile} from '@/server/nursery';

// Streams a nursery photo from R2. A published nursery's photos are public;
// an unpublished nursery's photos are served only to its owner (the
// authorization lives in getAccessibleNurseryPhotoFile). Anything not
// accessible — not found or not allowed — is a 404 so the endpoint discloses
// nothing.
export async function GET(
  _request: NextRequest,
  {params}: {params: Promise<{id: string}>},
) {
  const {id} = await params;
  const file = await getAccessibleNurseryPhotoFile(id);
  if (!file) {
    return new Response('Not found', {status: 404});
  }

  return new Response(file.body, {
    headers: {
      'Content-Type': file.contentType,
      'Content-Disposition': 'inline',
      // The content type is the uploader-supplied value and the bytes aren't
      // content-validated, so prevent MIME sniffing of a spoofed file.
      'X-Content-Type-Options': 'nosniff',
      // A photo's bytes never change for a given id (replacing a photo creates
      // a new row), so published photos can cache hard. Owner-only photos of an
      // unpublished nursery must stay out of shared caches.
      'Cache-Control': file.isPubliclyVisible
        ? 'public, max-age=31536000, immutable'
        : 'private, no-store',
    },
  });
}
