'use server';

import {
  signIn as logtoSignIn,
  signOut as logtoSignOut,
} from '@logto/next/server-actions';

import {logtoCallbackUrl, logtoConfig} from '@/lib/logto';

// Server Actions to trigger the Logto sign-in / sign-out flows from the UI
// (e.g. a form action or button). Both redirect the browser to Logto.
export async function signIn() {
  await logtoSignIn(logtoConfig, {redirectUri: logtoCallbackUrl});
}

export async function signOut() {
  await logtoSignOut(logtoConfig, logtoConfig.baseUrl);
}
