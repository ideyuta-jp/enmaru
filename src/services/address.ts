import type {PostalAddress} from '@/types/Address';

// Client-side postal-code → address lookup for form autofill (fetched on
// blur). Returns null on any failure — autofill silently degrades to manual
// input.
export async function lookupPostalAddress(
  postalCode: string,
): Promise<PostalAddress | null> {
  const response = await fetch(
    `/api/address?postalCode=${encodeURIComponent(postalCode)}`,
  );
  if (!response.ok) return null;
  const data = await response.json();
  return data.address;
}
