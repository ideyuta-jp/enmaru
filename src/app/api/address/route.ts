import {lookupPostalAddress} from '@/server/address';

// Client read path for postal-code → address autofill on profile forms.
// Postal-code → municipality mapping is public data, so no auth is required.
export async function GET(request: Request) {
  const postalCode = new URL(request.url).searchParams.get('postalCode') ?? '';
  const address = await lookupPostalAddress(postalCode);
  return Response.json({address});
}
