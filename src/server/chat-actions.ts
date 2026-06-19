'use server';

import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import {isChatOpen} from '@/server/chat';
import type {ActionResult} from '@/types/ActionResult';
import {MAX_CHAT_MESSAGE_LENGTH} from '@/types/Chat';
import {UserRole} from '@/types/User';

// Post a chat message to an engagement. Allowed only for the engagement's two
// parties (seeker / nursery) and only while chat is within its time window —
// both re-checked here authoritatively, not assumed from the page guard.
export async function sendChatMessage(
  engagementId: string,
  body: string,
): Promise<ActionResult> {
  const user = await requireRole([UserRole.SEEKER, UserRole.NURSERY]);

  const trimmed = body.trim();
  if (!trimmed) {
    return {ok: false, message: 'メッセージを入力してください。'};
  }
  if (trimmed.length > MAX_CHAT_MESSAGE_LENGTH) {
    return {
      ok: false,
      message: `メッセージは${MAX_CHAT_MESSAGE_LENGTH}文字以内で入力してください。`,
    };
  }

  const engagement = await prisma.engagement.findUnique({
    where: {id: engagementId},
    select: {
      status: true,
      completedAt: true,
      seeker: {select: {userId: true}},
      job: {select: {nursery: {select: {userId: true}}}},
    },
  });
  if (!engagement) {
    return {ok: false, message: '対象の業務が見つかりません。'};
  }

  const isParty =
    engagement.seeker.userId === user.id ||
    engagement.job.nursery.userId === user.id;
  if (!isParty) {
    return {ok: false, message: '対象の業務が見つかりません。'};
  }

  if (!isChatOpen(engagement.status, engagement.completedAt, new Date())) {
    return {ok: false, message: 'チャットの利用可能期間が終了しています。'};
  }

  await prisma.chatMessage.create({
    data: {engagementId, senderId: user.id, body: trimmed},
  });
  return {ok: true};
}
