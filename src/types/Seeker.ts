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
