import {unreadCountForCurrentUser} from '@/server/notification';

// Client read path for the header bell's unread badge (polled). Returns 0 for a
// guest rather than erroring, so the badge can poll on any page.
export async function GET() {
  const count = await unreadCountForCurrentUser();
  return Response.json(
    {count},
    {headers: {'Cache-Control': 'private, no-store'}},
  );
}
