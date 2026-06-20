// Notification kinds. Mirrors the (string) Notification.type column in the Prisma
// schema; hand-written union + value constants so client code does not depend on
// generated server code (same type+value pattern as UserRole / SeekerDocumentType).
// The schema keeps the column a String precisely so new kinds need no migration,
// so the UI treats `type` as a plain string and tolerates values not listed here.
export type NotificationType =
  | 'MATCH_FORMED'
  | 'DOCUMENT_APPROVED'
  | 'DOCUMENT_REJECTED'
  | 'WORK_REPORT_FILED'
  | 'REVIEW_REQUESTED';

export const NotificationType = {
  MATCH_FORMED: 'MATCH_FORMED',
  DOCUMENT_APPROVED: 'DOCUMENT_APPROVED',
  DOCUMENT_REJECTED: 'DOCUMENT_REJECTED',
  WORK_REPORT_FILED: 'WORK_REPORT_FILED',
  REVIEW_REQUESTED: 'REVIEW_REQUESTED',
} as const;

// One notification as shown to its recipient. `type` is a plain string (see
// above); `linkUrl` is the in-app destination to open on click, if any.
export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string; // ISO 8601
}

// Wire (Prisma row) -> domain shape: the only non-trivial conversion is the
// createdAt Date -> ISO string, colocated with the type per the types/ rules.
export function decodeNotification(row: {
  id: string;
  type: string;
  title: string;
  body: string;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: Date;
}): Notification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    linkUrl: row.linkUrl,
    isRead: row.isRead,
    createdAt: row.createdAt.toISOString(),
  };
}
