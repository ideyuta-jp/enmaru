// Whether a given party has filed a completed work report, from an engagement's
// work-report rows. Shared by the seeker and nursery list mappers so both read
// the report state the same way.
export function hasReported(
  reports: {reporter: string; completed: boolean}[],
  party: 'SEEKER' | 'NURSERY',
): boolean {
  return reports.some((r) => r.reporter === party && r.completed);
}
