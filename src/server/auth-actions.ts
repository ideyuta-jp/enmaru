'use server';

import {
  signIn as logtoSignIn,
  signOut as logtoSignOut,
} from '@logto/next/server-actions';

import {logtoCallbackUrl, logtoConfig} from '@/lib/logto';

// Server Actions that drive the Logto flows from the UI (form actions / client
// handlers). Kept in their own 'use server' file so client components can import
// them without dragging server-only modules (Prisma, etc.) into the client
// bundle. signIn redirects the browser to Logto; signOut routes through Logto's
// end-session endpoint and lands back at baseUrl (the app's own origin).
//
// `firstScreen` selects which Logto-hosted screen opens first: 'signIn' for the
// login entry, 'register' for the sign-up entry (both are valid Logto
// FirstScreen values).
export async function signIn(firstScreen: 'signIn' | 'register' = 'signIn') {
  await logtoSignIn(logtoConfig, {redirectUri: logtoCallbackUrl, firstScreen});
}

export async function signOut() {
  await logtoSignOut(logtoConfig, logtoConfig.baseUrl);
}
