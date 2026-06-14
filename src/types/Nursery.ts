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
  id: string;
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

// The editable shape of a nursery's own profile — form state + prefill. Unlike
// PublicNursery this includes the non-public fields (address / contactName /
// phone). Text fields are plain strings (empty = unset); the server maps empty
// to null when persisting.
export interface NurseryProfileInput {
  nurseryName: string;
  area: string;
  address: string;
  contactName: string;
  phone: string;
  concept: string;
  policy: string;
  isPublished: boolean;
}

export const EMPTY_NURSERY_PROFILE: NurseryProfileInput = {
  nurseryName: '',
  area: '',
  address: '',
  contactName: '',
  phone: '',
  concept: '',
  policy: '',
  isPublished: false,
};

// Nursery dashboard summary. Job / application counts come from later verticals
// and are 0 until then.
export interface NurseryDashboard {
  hasProfile: boolean;
  nurseryName: string | null;
  isPublished: boolean;
  openJobCount: number;
  newApplicationCount: number;
}
