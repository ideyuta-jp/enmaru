// UI-only placeholder. TODO(#7 follow-up): replace with a real Prisma query.

export interface SeekerDashboard {
  displayName: string | null;
  applicationCount: number;
  activeMatchCount: number;
}

export async function getSeekerDashboard(): Promise<SeekerDashboard> {
  return {
    displayName: 'みき',
    applicationCount: 3,
    activeMatchCount: 1,
  };
}
