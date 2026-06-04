// A spot-work posting created by a nursery.
export type JobStatus = 'OPEN' | 'CLOSED';

export interface Job {
  id: string;
  title: string;
  workContent: string;
  // ISO date string (YYYY-MM-DD). Kept as a string so the type stays wire-shaped
  // and tier-neutral; format for display at the edge.
  workDate: string;
  // 'HH:mm'
  workTimeStart: string;
  workTimeEnd: string;
  hourlyWage: number | null;
  targetPerson: string | null;
  remarks: string | null;
  status: JobStatus;
}
