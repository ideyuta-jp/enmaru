// Kinds of document a seeker submits. Mirrors the SeekerDocumentType enum in the
// Prisma schema; hand-written union + value constants so client code does not
// depend on generated server code (same type+value pattern as UserRole).
export type SeekerDocumentType =
  | 'RESUME'
  | 'LICENSE'
  | 'HEALTH_CHECK'
  | 'STOOL_TEST';

export const SeekerDocumentType = {
  RESUME: 'RESUME',
  LICENSE: 'LICENSE',
  HEALTH_CHECK: 'HEALTH_CHECK',
  STOOL_TEST: 'STOOL_TEST',
} as const;

// Verification status of a submitted document.
export type SeekerDocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export const SeekerDocumentStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

// Display order / iteration source for the document types.
export const ALL_DOCUMENT_TYPES: SeekerDocumentType[] = [
  SeekerDocumentType.RESUME,
  SeekerDocumentType.LICENSE,
  SeekerDocumentType.HEALTH_CHECK,
  SeekerDocumentType.STOOL_TEST,
];

export const DOCUMENT_TYPE_LABEL: Record<SeekerDocumentType, string> = {
  RESUME: '履歴書',
  LICENSE: '保育士証',
  HEALTH_CHECK: '健康診断書',
  STOOL_TEST: '検便結果',
};

export const DOCUMENT_STATUS_LABEL: Record<SeekerDocumentStatus, string> = {
  PENDING: '確認中',
  APPROVED: '認証済み',
  REJECTED: '差し戻し',
};

// A seeker's own document of a given type. Fields are null when nothing has
// been submitted for that type yet. `id` lets the seeker view their own file.
export interface MyDocument {
  id: string | null;
  documentType: SeekerDocumentType;
  status: SeekerDocumentStatus | null;
  rejectionReason: string | null;
  // ISO timestamp of the latest submission, or null if none.
  uploadedAt: string | null;
}

// A submitted document as the admin review console sees it.
export interface AdminDocument {
  id: string;
  seekerDisplayName: string;
  seekerRealName: string;
  documentType: SeekerDocumentType;
  status: SeekerDocumentStatus;
  rejectionReason: string | null;
  uploadedAt: string;
}
