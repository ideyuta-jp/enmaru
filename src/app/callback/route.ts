import {handleSignIn} from '@logto/next/server-actions';
import {redirect} from 'next/navigation';
import type {NextRequest} from 'next/server';

import {logtoConfig} from '@/lib/logto';

// Logto redirects here after the user completes the sign-in flow. We exchange
// the authorization code for a session, then send the user back to the app.
export async function GET(request: NextRequest) {
  await handleSignIn(logtoConfig, request.nextUrl.searchParams);
  redirect('/');
}
