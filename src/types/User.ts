// Account role. Mirrors the `Role` enum in the Prisma schema; kept as a
// hand-written union so the UI layer does not depend on generated server code.
export type UserRole = 'SEEKER' | 'NURSERY' | 'ADMIN';

// Role values, so call sites reference these constants instead of bare string
// literals (e.g. requireRole([UserRole.ADMIN])). Same name as the type — TS
// keeps type and value in separate namespaces, so both import together.
export const UserRole = {
  SEEKER: 'SEEKER',
  NURSERY: 'NURSERY',
  ADMIN: 'ADMIN',
} as const;

// Roles a user can self-register as. ADMIN is provisioned by the operator, never
// chosen at sign-up.
export type RegisterRole = Exclude<UserRole, 'ADMIN'>;

// The home page a freshly signed-in user of each role should land on. A pure
// role → path mapping, kept in types/ (client-safe) so server-side redirects
// and client-side router.push share one source of truth.
export function landingPathForRole(role: UserRole): string {
  if (role === UserRole.NURSERY) return '/nursery/mypage';
  if (role === UserRole.ADMIN) return '/admin/matches';
  return '/mypage';
}

export const ROLE_LABEL: Record<UserRole, string> = {
  SEEKER: '保育士',
  NURSERY: '保育園',
  ADMIN: '管理者',
};

// How far a user has taken their role's profile. Not stored: derived from the
// profile row's existence plus its isPublished flag, which is the same pair for
// SeekerProfile and NurseryProfile (see deriveProfileState).
export type ProfileState = 'NONE' | 'DRAFT' | 'PUBLISHED';

export const ProfileState = {
  NONE: 'NONE',
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
} as const;

export const PROFILE_STATE_LABEL: Record<ProfileState, string> = {
  NONE: '未作成',
  DRAFT: '下書き',
  PUBLISHED: '公開中',
};

// Profile row (or its absence) -> display state. Pure so both roles share one
// rule and it can be unit-tested without a database. An admin has no profile of
// either kind, which lands on NONE.
export function deriveProfileState(
  profile: {isPublished: boolean} | null,
): ProfileState {
  if (!profile) return ProfileState.NONE;
  return profile.isPublished ? ProfileState.PUBLISHED : ProfileState.DRAFT;
}

// Days without a sign-in after which the admin list calls an account dormant.
// An operating heuristic for "who has gone quiet", not a business rule — no
// behavior is gated on it.
export const DORMANT_DAYS = 30;

// Whether an account counts as dormant. A user who has never signed in since
// User.lastSignInAt was introduced (null) is NOT dormant: the null is missing
// data, and calling it dormant would flag every pre-existing account on the day
// this shipped. Exported for the filter's cutoff and for display.
export function dormantCutoff(now: Date, days: number = DORMANT_DAYS): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

// One account as the admin user list sees it. Admins may see the real name and
// the email always (docs/requirements.md's personal-information boundary), so
// this shape is admin-only — never reuse it for a nursery- or seeker-facing
// view.
export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  // Seeker: displayName / realName. Nursery: nurseryName / contactName.
  // Both null for an admin, and for a user who has not created a profile yet.
  name: string | null;
  realName: string | null;
  profileState: ProfileState;
  createdAt: string;
  // ISO timestamp, or null when the user has not signed in since the field was
  // introduced (see the schema comment on User.lastSignInAt).
  lastSignInAt: string | null;
  agreedAt: string | null;
  // Whether LINE pushes can actually reach this user (User.lineUserId is set).
  lineLinked: boolean;
  // Seeker document verification, by status. All zero for a nursery/admin.
  documentCounts: {approved: number; pending: number; rejected: number};
  // Engagements this user is a party to, as seeker or as nursery.
  engagementCount: number;
  completedCount: number;
  // 'YYYY-MM-DD' of the latest completed engagement's work date, or null.
  lastWorkDate: string | null;
}

// The one filter knob on the admin user list, carried in the query string
// (?filter=...). Role values narrow by role; the last two answer the operating
// questions the list exists for ("who is waiting on me?", "who went quiet?").
export type AdminUserFilter =
  | 'SEEKER'
  | 'NURSERY'
  | 'ADMIN'
  | 'DOCUMENT_PENDING'
  | 'DORMANT';

export const AdminUserFilter = {
  SEEKER: 'SEEKER',
  NURSERY: 'NURSERY',
  ADMIN: 'ADMIN',
  DOCUMENT_PENDING: 'DOCUMENT_PENDING',
  DORMANT: 'DORMANT',
} as const;

export const ADMIN_USER_FILTER_LABEL: Record<AdminUserFilter, string> = {
  SEEKER: ROLE_LABEL.SEEKER,
  NURSERY: ROLE_LABEL.NURSERY,
  ADMIN: ROLE_LABEL.ADMIN,
  DOCUMENT_PENDING: '確認待ち書類あり',
  DORMANT: `${DORMANT_DAYS}日以上未サインイン`,
};

// Sort order of the admin user list.
export type AdminUserSort = 'REGISTERED' | 'LAST_SIGN_IN';

export const AdminUserSort = {
  REGISTERED: 'REGISTERED',
  LAST_SIGN_IN: 'LAST_SIGN_IN',
} as const;

export const ADMIN_USER_SORT_LABEL: Record<AdminUserSort, string> = {
  REGISTERED: '登録が新しい順',
  LAST_SIGN_IN: 'サインインが新しい順',
};
