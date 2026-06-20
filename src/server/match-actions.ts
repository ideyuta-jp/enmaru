'use server';

import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import type {ActionResult} from '@/types/ActionResult';
import {UserRole} from '@/types/User';

// Admin sets (or clears) the operator memo on an engagement. The lifecycle status
// itself is driven by the work-flow / review verticals, not edited here — the
// admin console only annotates. Guarded to ADMIN.
export async function setEngagementMemo(
  id: string,
  memo: string,
): Promise<ActionResult> {
  await requireRole([UserRole.ADMIN]);
  const engagement = await prisma.engagement.findUnique({where: {id}});
  if (!engagement) {
    return {ok: false, message: '対象のマッチングが見つかりません。'};
  }

  await prisma.engagement.update({
    where: {id},
    data: {adminMemo: memo.trim() || null},
  });
  return {ok: true};
}
