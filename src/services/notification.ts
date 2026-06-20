import type {Notification} from '@/types/Notification';

// Client-side reads for the notification UI. The drawer fetches the list on open;
// the header bell polls the unread count. Both hit the route handlers under
// app/api/notifications; no-store so each call sees the latest.

export async function fetchNotifications(): Promise<Notification[]> {
  const response = await fetch('/api/notifications', {cache: 'no-store'});
  if (!response.ok) {
    throw new Error(`Failed to load notifications (${response.status})`);
  }
  const data = await response.json();
  return data.notifications;
}

export async function fetchUnreadCount(): Promise<number> {
  const response = await fetch('/api/notifications/unread-count', {
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`Failed to load unread count (${response.status})`);
  }
  const data = await response.json();
  return data.count;
}
