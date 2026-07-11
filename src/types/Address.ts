// Address resolved from a postal code, shared by the lookup route handler and
// its client-side services/ wrapper.
export interface PostalAddress {
  prefecture: string;
  city: string;
}
