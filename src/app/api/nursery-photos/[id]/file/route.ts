import type {NextRequest} from 'next/server';

import {prisma} from '@/lib/prisma';
import {getObjectStream} from '@/lib/storage';

// Streams a nursery photo from R2. Public endpoint — no auth required since
// photos are part of the public nursery profile.
export async function GET(
  _request: NextRequest,
  {params}: {params: Promise<{id: string}>},
) {
  const {id} = await params;
  const photo = await prisma.nurseryPhoto.findUnique({
    where: {id},
    include: {nursery: {select: {isPublished: true}}},
  });
  if (!photo || !photo.fileKey) {
    return new Response('Not found', {status: 404});
  }

  try {
    const file = await getObjectStream(photo.fileKey);
    return new Response(file.body, {
      headers: {
        'Content-Type': file.contentType,
        'Content-Disposition': 'inline',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response('Not found', {status: 404});
  }
}
