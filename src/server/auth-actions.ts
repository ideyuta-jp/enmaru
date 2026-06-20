'use server';

import {
  signIn as logtoSignIn,
  signOut as logtoSignOut,
} from '@logto/next/server-actions';

import {logtoCallbackUrl, logtoConfig} from '@/lib/logto';

// Server Actions that drive the Logto flows from the UI (form actions / client
// handlers). Kept in their own 'use server' file so client components can import
// them without dragging server-only modules (Prisma, etc.) into the client
// bundle. Both redirect the browser to Logto.
export async function signIn() {
  await logtoSignIn(logtoConfig, {redirectUri: logtoCallbackUrl});
}

export async function signOut() {
  await logtoSignOut(logtoConfig, logtoConfig.baseUrl);
}
