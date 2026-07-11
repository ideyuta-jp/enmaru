import {handleSignIn} from '@logto/next/server-actions';
import {redirect} from 'next/navigation';
import type {NextRequest} from 'next/server';

import {logtoConfig} from '@/lib/logto';
import {getCurrentUser} from '@/server/auth';
import {landingPathForRole} from '@/types/User';

// Logto redirects here after the user completes the sign-in flow. We exchange
// the authorization code for a session, then route by registration state:
// existing users go to their dashboard, brand-new ones to registration.
export async function GET(request: NextRequest) {
  await handleSignIn(logtoConfig, request.nextUrl.searchParams);
  const user = await getCurrentUser();
  redirect(user ? landingPathForRole(user.role) : '/register');
}
