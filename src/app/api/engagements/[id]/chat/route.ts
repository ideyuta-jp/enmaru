import type {NextRequest} from 'next/server';

import {getChatThread} from '@/server/chat';

// Client-side read path for the chat panel's polling. Authorization (party-only)
// lives in getChatThread; a non-party or unknown engagement is a 404 so the
// endpoint discloses nothing about engagements the caller is not part of.
export async function GET(
  _request: NextRequest,
  {params}: {params: Promise<{id: string}>},
) {
  const {id} = await params;
  const thread = await getChatThread(id);
  if (!thread) {
    return new Response('Not found', {status: 404});
  }

  return Response.json(thread, {
    headers: {'Cache-Control': 'private, no-store'},
  });
}
