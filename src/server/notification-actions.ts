'use server';

import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import type {ActionResult} from '@/types/ActionResult';
import {UserRole} from '@/types/User';

const ANY_ROLE = [UserRole.SEEKER, UserRole.NURSERY, UserRole.ADMIN];

// Mark one notification read. Ownership is enforced in the WHERE (userId), so a
// foreign or unknown id is a silent no-op rather than a leak or an error.
export async function markNotificationRead(id: string): Promise<ActionResult> {
  const user = await requireRole(ANY_ROLE);
  await prisma.notification.updateMany({
    where: {id, userId: user.id},
    data: {isRead: true},
  });
  return {ok: true};
}

// Mark all of the signed-in user's unread notifications read.
export async function markAllNotificationsRead(): Promise<ActionResult> {
  const user = await requireRole(ANY_ROLE);
  await prisma.notification.updateMany({
    where: {userId: user.id, isRead: false},
    data: {isRead: true},
  });
  return {ok: true};
}
