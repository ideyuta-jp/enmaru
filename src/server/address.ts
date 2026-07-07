import {searchZipcode} from '@/lib/zipcloud';
import type {PostalAddress} from '@/types/Address';

// Resolve a postal code (hyphen optional) to prefecture/city for address
// autofill. Zipcloud splits the address into prefecture / city / town; town is
// merged into city to match the NurseryProfile field granularity. Returns null
// for malformed codes and lookup misses alike — the form falls back to manual
// input either way.
export async function lookupPostalAddress(
  postalCode: string,
): Promise<PostalAddress | null> {
  const zipcode = postalCode.replace(/-/g, '');
  if (!/^\d{7}$/.test(zipcode)) return null;

  const result = await searchZipcode(zipcode);
  if (!result) return null;

  return {
    prefecture: result.address1,
    city: result.address2 + result.address3,
  };
}
