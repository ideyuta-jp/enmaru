import {prisma} from '@/lib/prisma';
import {getObjectStream, putObject} from '@/lib/storage';
import {getCurrentUser, requireRole} from '@/server/auth';
import {
  ALL_DOCUMENT_TYPES,
  type AdminDocument,
  type MyDocument,
  SeekerDocumentStatus,
  type SeekerDocumentType,
} from '@/types/Document';
import {UserRole} from '@/types/User';

// Store a finished file as the seeker's submitted document — one R2 object and
// one SeekerDocument row per (seeker, type). Both submission paths
// (document-actions.ts's manual upload and resume-actions.ts's generated
// résumé PDF) go through here so the key scheme and the reset-to-PENDING
// re-review semantics can never drift apart. Callers are responsible for
// authorization: seekerId must belong to the already-authenticated seeker.
export async function storeSeekerDocument(
  seekerId: string,
  documentType: SeekerDocumentType,
  body: Uint8Array,
  contentType: string,
): Promise<void> {
  const key = `seeker-documents/${seekerId}/${documentType}`;
  await putObject(key, body, contentType);
  await prisma.seekerDocument.upsert({
    where: {seekerId_documentType: {seekerId, documentType}},
    update: {
      fileKey: key,
      status: SeekerDocumentStatus.PENDING,
      rejectionReason: null,
      uploadedAt: new Date(),
      verifiedAt: null,
    },
    create: {seekerId, documentType, fileKey: key},
  });
}

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

  try {
    return await getObjectStream(doc.fileKey);
  } catch {
    // Row exists but the R2 object is missing (drift) — treat as not found so
    // the route keeps its 404-for-everything contract instead of 500-ing.
    return null;
  }
}
