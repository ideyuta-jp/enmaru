import {prisma} from '@/lib/prisma';
import {getObjectStream} from '@/lib/storage';
import {getCurrentUser, requireRole} from '@/server/auth';
import {
  ALL_DOCUMENT_TYPES,
  type AdminDocument,
  type MyDocument,
  type SeekerDocumentStatus,
} from '@/types/Document';
import {UserRole} from '@/types/User';

// The signed-in seeker's documents, one entry per type (status null = not yet
// submitted). Guarded to SEEKER.
export async function listMyDocuments(): Promise<MyDocument[]> {
  const user = await requireRole([UserRole.SEEKER]);
  const profile = await prisma.seekerProfile.findUnique({
    where: {userId: user.id},
  });
  const docs = profile
    ? await prisma.seekerDocument.findMany({where: {seekerId: profile.id}})
    : [];
  const byType = new Map(docs.map((d) => [d.documentType, d]));

  return ALL_DOCUMENT_TYPES.map((documentType) => {
    const d = byType.get(documentType);
    return {
      id: d?.id ?? null,
      documentType,
      status: d?.status ?? null,
      rejectionReason: d?.rejectionReason ?? null,
      uploadedAt: d?.uploadedAt.toISOString() ?? null,
    };
  });
}

// All submitted documents for the admin review console, newest first, optionally
// filtered by status. Guarded to ADMIN.
export async function listSubmittedDocuments(
  status?: SeekerDocumentStatus,
): Promise<AdminDocument[]> {
  await requireRole([UserRole.ADMIN]);
  const docs = await prisma.seekerDocument.findMany({
    where: status ? {status} : undefined,
    include: {seeker: {select: {displayName: true, realName: true}}},
    orderBy: {uploadedAt: 'desc'},
  });
  return docs.map((d) => ({
    id: d.id,
    seekerDisplayName: d.seeker.displayName,
    seekerRealName: d.seeker.realName,
    documentType: d.documentType,
    status: d.status,
    rejectionReason: d.rejectionReason,
    uploadedAt: d.uploadedAt.toISOString(),
  }));
}

// File bytes for the download route, but only for the admin or the owning
// seeker. Returns null when not signed in, not found, or not authorized — the
// route maps that to 404 (no existence disclosure).
export async function getAccessibleDocumentFile(
  id: string,
): Promise<{body: ReadableStream; contentType: string} | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const doc = await prisma.seekerDocument.findUnique({
    where: {id},
    include: {seeker: {select: {userId: true}}},
  });
  if (!doc) return null;

  const isAdmin = user.role === UserRole.ADMIN;
  const isOwner = doc.seeker.userId === user.id;
  if (!isAdmin && !isOwner) return null;

  return getObjectStream(doc.fileKey);
}
