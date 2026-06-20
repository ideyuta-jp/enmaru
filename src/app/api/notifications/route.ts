import {listForCurrentUser} from '@/server/notification';

// Client read path for the notification drawer (fetched when the drawer opens).
// Authorization lives in listForCurrentUser (returns only the caller's own rows).
export async function GET() {
  const notifications = await listForCurrentUser();
  return Response.json(
    {notifications},
    {headers: {'Cache-Control': 'private, no-store'}},
  );
}
