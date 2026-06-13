// The editable shape of a seeker's own profile — what the edit form holds and
// sends, and what the page prefills it with. Text fields are plain strings
// (empty string = unset) so the form can bind to them directly; the server maps
// empty strings to null when persisting.
export interface SeekerProfileInput {
  realName: string;
  displayName: string;
  license: boolean;
  blankYears: string;
  preferredArea: string;
  preferredStyle: string[];
  bio: string;
  experience: string;
  skills: string;
  ngConditions: string;
  isPublished: boolean;
}

// A blank profile for the create case (no profile yet).
export const EMPTY_SEEKER_PROFILE: SeekerProfileInput = {
  realName: '',
  displayName: '',
  license: false,
  blankYears: '',
  preferredArea: '',
  preferredStyle: [],
  bio: '',
  experience: '',
  skills: '',
  ngConditions: '',
  isPublished: false,
};

// Seeker dashboard summary. Counts come from engagements; they are 0 until the
// posting/engagement verticals exist.
export interface SeekerDashboard {
  hasProfile: boolean;
  displayName: string | null;
  applicationCount: number;
  activeEngagementCount: number;
}
