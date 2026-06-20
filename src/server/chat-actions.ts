'use server';

import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import {isChatOpen} from '@/server/chat';
import {notify} from '@/server/notification';
import type {ActionResult} from '@/types/ActionResult';
import {MAX_CHAT_MESSAGE_LENGTH} from '@/types/Chat';
import {NotificationType} from '@/types/Notification';
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
      seeker: {select: {userId: true, displayName: true}},
      job: {select: {nursery: {select: {userId: true, nurseryName: true}}}},
    },
  });
  if (!engagement) {
    return {ok: false, message: '対象の業務が見つかりません。'};
  }

  const seeker = engagement.seeker;
  const nursery = engagement.job.nursery;
  const isSeeker = seeker.userId === user.id;
  const isNursery = nursery.userId === user.id;
  const isParty = isSeeker || isNursery;
  // Unlike the not-found case above (which hides whether the engagement exists),
  // a distinct "you're not a party" message is fine here: sendChatMessage is only
  // reached from the chat page, which getChatThread already gates to the two
  // parties, so this doesn't leak engagement existence to an outsider.
  if (!isParty) {
    return {
      ok: false,
      message: 'このチャットの当事者ではないため、メッセージを送信できません。',
    };
  }

  if (!isChatOpen(engagement.status, engagement.completedAt, new Date())) {
    return {ok: false, message: 'チャットの利用可能期間が終了しています。'};
  }

  await prisma.chatMessage.create({
    data: {engagementId, senderId: user.id, body: trimmed},
  });

  // Notify the other party of the new message, linking to their side of the chat.
  // After the write so a notification failure can't fail the send; notify() never
  // throws.
  const senderName = isSeeker ? seeker.displayName : nursery.nurseryName;
  await notify({
    userId: isSeeker ? nursery.userId : seeker.userId,
    type: NotificationType.MESSAGE_RECEIVED,
    title: 'メッセージが届きました',
    body: `${senderName}からメッセージが届いています。`,
    linkUrl: isSeeker
      ? `/nursery/chat/${engagementId}`
      : `/chat/${engagementId}`,
  });
  return {ok: true};
}
