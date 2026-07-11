import type {Job} from '@/types/Job';

// Aggregated rating shown on nursery cards and detail pages. `total` is the mean
// across all review criteria (0-5), `count` the number of published reviews.
export interface NurseryRating {
  total: number;
  count: number;
}

// The public-facing subset of a nursery profile (no contact details).
export interface PublicNursery {
  id: string;
  nurseryName: string;
  prefecture: string | null;
  city: string | null;
  featureTags: string[];
  featureNote: string | null;
  receptionTags: string[];
  receptionNote: string | null;
  joinReason: string | null;
  idealPartner: string | null;
  additionalNotes: string | null;
  homepageUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  facebookUrl: string | null;
  otherSnsUrl: string | null;
  rating: NurseryRating | null;
  mainPhotoId: string | null;
}

// Display string for a nursery's location. Prefecture and city are the only
// address parts in the public projection, so this is the single definition of
// how a nursery's location renders (cards, detail page).
export function formatNurseryLocation(nursery: {
  prefecture: string | null;
  city: string | null;
}): string {
  return [nursery.prefecture, nursery.city].filter(Boolean).join(' ');
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
  photos: {id: string}[];
}

// The editable shape of a nursery's own profile — form state + prefill.
// Text fields are plain strings (empty = unset); the server maps empty to null
// when persisting. Tag fields are string arrays.
export interface NurseryProfileInput {
  nurseryName: string;
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine: string;
  phone: string;
  contactName: string;
  homepageUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  facebookUrl: string;
  otherSnsUrl: string;
  featureTags: string[];
  featureNote: string;
  receptionTags: string[];
  receptionNote: string;
  joinReason: string;
  idealPartner: string;
  additionalNotes: string;
  isPublished: boolean;
}

export const EMPTY_NURSERY_PROFILE: NurseryProfileInput = {
  nurseryName: '',
  postalCode: '',
  prefecture: '',
  city: '',
  addressLine: '',
  phone: '',
  contactName: '',
  homepageUrl: '',
  instagramUrl: '',
  twitterUrl: '',
  facebookUrl: '',
  otherSnsUrl: '',
  featureTags: [],
  featureNote: '',
  receptionTags: [],
  receptionNote: '',
  joinReason: '',
  idealPartner: '',
  additionalNotes: '',
  isPublished: false,
};

// Nursery dashboard summary. Job / application counts come from later verticals
// and are 0 until then.
export interface NurseryDashboard {
  hasProfile: boolean;
  // The nursery profile's id (null when no profile yet); used to link to its own
  // public page for preview.
  id: string | null;
  nurseryName: string | null;
  isPublished: boolean;
  openJobCount: number;
  newApplicationCount: number;
}
