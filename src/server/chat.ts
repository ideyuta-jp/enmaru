import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import type {ChatThread} from '@/types/Chat';
import {EngagementStatus} from '@/types/Engagement';
import {UserRole} from '@/types/User';

// Chat stays open for 24h after the work is completed.
const CHAT_GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;

// Whether chat is within its available window. The window runs from when the
// engagement forms until 24h after completion. An Engagement is born at MATCHED
// and has no pre-match state, so the lower bound is always satisfied; only the
// upper bound can close chat. Centralized here so the read (getChatThread) and
// the write (sendChatMessage) judge the window identically.
export function isChatOpen(
  status: EngagementStatus,
  completedAt: Date | null,
  now: Date,
): boolean {
  if (status !== EngagementStatus.COMPLETED) return true;
  // COMPLETED implies completedAt is set; treat a missing one as still-open
  // rather than silently closing chat on a data inconsistency.
  if (!completedAt) return true;
  return now.getTime() - completedAt.getTime() < CHAT_GRACE_PERIOD_MS;
}

// The chat view for one engagement: the messages and the current window state.
// Returns null when the engagement does not exist or the viewer is not one of its
// two parties. Guarded to SEEKER / NURSERY; the send action re-checks party
// membership and the window authoritatively.
export async function getChatThread(
  engagementId: string,
): Promise<ChatThread | null> {
  const user = await requireRole([UserRole.SEEKER, UserRole.NURSERY]);

  const engagement = await prisma.engagement.findUnique({
    where: {id: engagementId},
    include: {
      job: {
        select: {
          nursery: {select: {userId: true}},
        },
      },
      seeker: {select: {userId: true}},
      chatMessages: {
        orderBy: {createdAt: 'asc'},
        select: {id: true, body: true, senderId: true, createdAt: true},
      },
    },
  });
  if (!engagement) return null;

  const seekerUserId = engagement.seeker.userId;
  const nurseryUserId = engagement.job.nursery.userId;
  const isSeeker = seekerUserId === user.id;
  const isNursery = nurseryUserId === user.id;
  if (!isSeeker && !isNursery) return null;

  return {
    engagementId: engagement.id,
    viewerParty: isSeeker ? 'SEEKER' : 'NURSERY',
    open: isChatOpen(engagement.status, engagement.completedAt, new Date()),
    messages: engagement.chatMessages.map((m) => ({
      id: m.id,
      body: m.body,
      senderParty: m.senderId === seekerUserId ? 'SEEKER' : 'NURSERY',
      createdAt: m.createdAt.toISOString(),
    })),
  };
}
