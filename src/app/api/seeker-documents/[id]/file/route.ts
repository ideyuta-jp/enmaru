import type {NextRequest} from 'next/server';

import {getAccessibleDocumentFile} from '@/server/document';

// Streams a submitted document's file from R2, but only to the admin or the
// owning seeker (the authorization lives in getAccessibleDocumentFile). Anything
// not accessible — not signed in, not found, or not allowed — is a 404 so the
// endpoint discloses nothing.
export async function GET(
  _request: NextRequest,
  {params}: {params: Promise<{id: string}>},
) {
  const {id} = await params;
  const file = await getAccessibleDocumentFile(id);
  if (!file) {
    return new Response('Not found', {status: 404});
  }

  return new Response(file.body, {
    headers: {
      'Content-Type': file.contentType,
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, no-store',
    },
  });
}
