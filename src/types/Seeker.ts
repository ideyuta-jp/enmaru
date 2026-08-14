// The editable shape of a seeker's own profile — what the edit form holds and
// sends, and what the page prefills it with. Text fields are plain strings
// (empty string = unset) so the form can bind to them directly; the server maps
// empty strings to null when persisting.
export interface SeekerProfileInput {
  realName: string;
  displayName: string;
  preferredPrefecture: string;
  preferredCity: string;
  licenses: string[];
  experienceYears: string;
  blankYears: string;
  skills: string[];
  skillsNote: string;
  experience: string;
  preferredPeriod: string[];
  preferredTimeSlot: string[];
  preferredAgeGroups: string[];
  values: string;
  bio: string;
  messageToNursery: string;
  ngConditions: string[];
  ngConditionsNote: string;
  isPublished: boolean;
}

// A blank profile for the create case (no profile yet).
export const EMPTY_SEEKER_PROFILE: SeekerProfileInput = {
  realName: '',
  displayName: '',
  preferredPrefecture: '',
  preferredCity: '',
  licenses: [],
  experienceYears: '',
  blankYears: '',
  skills: [],
  skillsNote: '',
  experience: '',
  preferredPeriod: [],
  preferredTimeSlot: [],
  preferredAgeGroups: [],
  values: '',
  bio: '',
  messageToNursery: '',
  ngConditions: [],
  ngConditionsNote: '',
  isPublished: false,
};

// The nursery-facing public subset of a seeker profile, for the browse list
// card. The private boundary from the SeekerProfile field comments is enforced
// here by omission: realName, ngConditions / ngConditionsNote (非公開) and the
// match-only fields blankYears / experience are never part of this shape, so
// they cannot leak into the nursery-facing list. Only published profiles
// (isPublished) are ever projected into it.
export interface PublicSeeker {
  id: string;
  displayName: string;
  preferredPrefecture: string | null;
  preferredCity: string | null;
  licenses: string[];
  experienceYears: string | null;
  skills: string[];
  preferredAgeGroups: string[];
}

// A seeker's public detail, as shown on the nursery-facing detail page. Extends
// the card subset with the remaining public free-text / preference fields. The
// same private boundary applies — match-only (blankYears / experience) and
// 非公開 (realName / ngConditions*) fields stay out of the projection.
export interface PublicSeekerDetail extends PublicSeeker {
  skillsNote: string | null;
  preferredPeriod: string[];
  preferredTimeSlot: string[];
  values: string | null;
  bio: string | null;
  messageToNursery: string | null;
}

// Display string for a seeker's preferred area. Prefecture and city are the
// only location parts in the public projection, so this is the single
// definition of how a seeker's preferred area renders (cards, detail page).
export function formatSeekerPreferredArea(seeker: {
  preferredPrefecture: string | null;
  preferredCity: string | null;
}): string {
  return [seeker.preferredPrefecture, seeker.preferredCity]
    .filter(Boolean)
    .join(' ');
}

// Seeker dashboard summary. Counts come from engagements; they are 0 until the
// posting/engagement verticals exist.
export interface SeekerDashboard {
  hasProfile: boolean;
  displayName: string | null;
  applicationCount: number;
  activeEngagementCount: number;
  // Baseline-document state for the mypage nudge. Both false when the seeker has
  // no profile yet (documents are keyed to the profile).
  hasMissingRequiredDocuments: boolean;
  hasPendingDocuments: boolean;
}
