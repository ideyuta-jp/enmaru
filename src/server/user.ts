'use server';

import {redirect} from 'next/navigation';

import {getAuthContextWithUserInfo} from '@/lib/logto';
import {prisma} from '@/lib/prisma';
import type {ActionResult} from '@/types/ActionResult';
import type {RegisterRole} from '@/types/User';

// Server Action: finish registration for a Logto-authenticated user who has no
// User row yet. The caller (RegisterForm) only reaches this after the user picks
// a role and agrees to the terms. Creates the User only — the role's profile
// (SeekerProfile / NurseryProfile) is created later, in the profile vertical.
//
// Returns ActionResult and lets the client navigate on ok, like every other
// action. Ending in redirect() instead would reject the awaited promise by
// design (the client runtime hands redirects to the RedirectBoundary that
// way), which a client-side catch reads as a failure.
export async function registerCurrentUser(
  role: RegisterRole,
): Promise<ActionResult> {
  const {isAuthenticated, claims, userInfo} =
    await getAuthContextWithUserInfo();
  // A real auth bounce (the session died between rendering the form and
  // submitting), not a routine result — unlike the success path, redirecting
  // here is intended even though the client catch may flash briefly.
  if (!isAuthenticated || !claims?.sub) redirect('/login');

  const email = userInfo?.email;
  if (!email) {
    // The User record requires an email; Logto must expose it (email scope).
    // An unexpected configuration error, not a validation result — throw and
    // let the caller surface it generically (see types/ActionResult.ts).
    throw new Error('No email available from Logto for this account.');
  }

  await prisma.user.upsert({
    where: {authId: claims.sub},
    // Already registered (e.g. a double submit): leave the existing row as-is.
    update: {},
    create: {authId: claims.sub, email, role, agreedAt: new Date()},
  });

  return {ok: true};
}
