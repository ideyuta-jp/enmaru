import type {ChatThread} from '@/types/Chat';

// Client-side fetch of an engagement's chat thread, used by ChatPanel to poll
// for the counterpart's new messages. Reads the route handler at
// app/api/engagements/[id]/chat; no-store so each poll sees the latest.
export async function fetchChatThread(
  engagementId: string,
): Promise<ChatThread> {
  const response = await fetch(`/api/engagements/${engagementId}/chat`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`Failed to load chat (${response.status})`);
  }
  return response.json();
}
