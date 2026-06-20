import {pushLineMessage} from '@/lib/line';
import {prisma} from '@/lib/prisma';
import {getCurrentUser, requireRole} from '@/server/auth';
import {decodeNotification, type NotificationType} from '@/types/Notification';
import {UserRole} from '@/types/User';

// The single seam for raising a notification. Records the durable in-app row,
// then best-effort pushes to LINE. The whole thing is wrapped so it NEVER throws:
// callers fire it after their domain transaction has committed, and a failed
// notification (in-app or LINE) must not affect the action's result. Failures are
// logged, not surfaced.
export async function notify(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  linkUrl?: string;
}): Promise<void> {
  const {userId, type, title, body, linkUrl} = input;
  try {
    await prisma.notification.create({
      data: {userId, type, title, body, linkUrl: linkUrl ?? null},
    });
  } catch (e) {
    console.error('notify: failed to record in-app notification', {
      userId,
      type,
      error: e,
    });
    return;
  }

  // LINE is a separate best-effort channel: a failure here must not hide the
  // in-app notification that already succeeded.
  try {
    const user = await prisma.user.findUnique({
      where: {id: userId},
      select: {lineUserId: true},
    });
    await pushLineMessage(user?.lineUserId ?? null, `${title}\n${body}`);
  } catch (e) {
    console.error('notify: LINE push failed', {userId, type, error: e});
  }
}

// Raise the same notification to several recipients, each independent so one
// failure does not skip the rest.
export async function notifyMany(
  userIds: string[],
  payload: {
    type: NotificationType;
    title: string;
    body: string;
    linkUrl?: string;
  },
): Promise<void> {
  await Promise.all(userIds.map((userId) => notify({userId, ...payload})));
}

// The signed-in user's notifications, newest first (capped). Guarded to any
// signed-in role; a user only ever sees their own rows.
export async function listForCurrentUser() {
  const user = await requireRole([
    UserRole.SEEKER,
    UserRole.NURSERY,
    UserRole.ADMIN,
  ]);
  const rows = await prisma.notification.findMany({
    where: {userId: user.id},
    orderBy: {createdAt: 'desc'},
    take: 30,
  });
  return rows.map(decodeNotification);
}

// Unread count for the header badge. Returns 0 when not signed in (the badge
// route is polled even on public pages), so it never throws for a guest.
export async function unreadCountForCurrentUser(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) return 0;
  return prisma.notification.count({
    where: {userId: user.id, isRead: false},
  });
}
