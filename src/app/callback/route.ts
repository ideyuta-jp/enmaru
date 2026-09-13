import {handleSignIn} from '@logto/next/server-actions';
import {redirect} from 'next/navigation';
import type {NextRequest} from 'next/server';

import {logtoConfig} from '@/lib/logto';
import {getCurrentUser} from '@/server/auth';
import {recordSignIn} from '@/server/user';
import {landingPathForRole} from '@/types/User';

// Logto redirects here after the user completes the sign-in flow. We exchange
// the authorization code for a session, then route by registration state:
// existing users go to their dashboard, brand-new ones to registration.
//
// This is also the only place every sign-in passes through, so it is where
// User.lastSignInAt is stamped for the admin user list (#223). A brand-new user
// has no User row yet; their first stamp lands on their next sign-in.
export async function GET(request: NextRequest) {
  await handleSignIn(logtoConfig, request.nextUrl.searchParams);
  const user = await getCurrentUser();
  if (user) await recordSignIn(user.id);
  redirect(user ? landingPathForRole(user.role) : '/register');
}
