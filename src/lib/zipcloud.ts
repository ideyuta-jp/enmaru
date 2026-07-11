// Zipcloud postal-code search client (https://zipcloud.ibsnet.co.jp). Free
// public API, no credentials. This module only knows how to call the service;
// mapping its result onto domain address fields lives in server/address.ts.

const SEARCH_ENDPOINT = 'https://zipcloud.ibsnet.co.jp/api/search';

export interface ZipcloudAddress {
  address1: string; // prefecture
  address2: string; // city / ward
  address3: string; // town area
}

// Returns the first match for a 7-digit zipcode (no hyphen), or null when the
// code is unknown or the service is unavailable — lookup failure is expected
// to degrade to manual input, not to error.
export async function searchZipcode(
  zipcode: string,
): Promise<ZipcloudAddress | null> {
  const response = await fetch(
    `${SEARCH_ENDPOINT}?zipcode=${encodeURIComponent(zipcode)}`,
  );
  if (!response.ok) return null;
  const data = await response.json();
  return data.results?.[0] ?? null;
}
