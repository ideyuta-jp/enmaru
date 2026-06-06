import type {Job} from '@/types/Job';

// Aggregated rating shown on nursery cards and detail pages. `total` is the mean
// across all review criteria (0-5), `count` the number of published reviews.
export interface NurseryRating {
  total: number;
  count: number;
}

// The public-facing subset of a nursery profile (no address / contact details).
export interface PublicNursery {
  id: string;
  nurseryName: string;
  area: string;
  concept: string | null;
  policy: string | null;
  rating: NurseryRating | null;
}

// A single published review of a nursery, as shown on its detail page.
export interface NurseryReview {
  comment: string | null;
  // ISO timestamp
  reviewedAt: string;
}

// A nursery detail page bundles the public profile with its open postings and
// published reviews.
export interface PublicNurseryDetail extends PublicNursery {
  jobPostings: Job[];
  reviews: NurseryReview[];
}
