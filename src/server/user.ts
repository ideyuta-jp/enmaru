'use server';

import {redirect} from 'next/navigation';

import {getAuthContextWithUserInfo} from '@/lib/logto';
import {prisma} from '@/lib/prisma';
import {landingPathForRole} from '@/server/auth';
import type {Role} from '@/generated/prisma/client';

// Server Action: finish registration for a Logto-authenticated user who has no
// User row yet. The caller (RegisterForm) only reaches this after the user picks
// a role and agrees to the terms. Creates the User only — the role's profile
// (SeekerProfile / NurseryProfile) is created later, in the profile vertical.
export async function registerCurrentUser(role: Role) {
  const {isAuthenticated, claims, userInfo} =
    await getAuthContextWithUserInfo();
  if (!isAuthenticated || !claims?.sub) redirect('/login');

  const email = userInfo?.email;
  if (!email) {
    // The User record requires an email; Logto must expose it (email scope).
    throw new Error('No email available from Logto for this account.');
  }

  await prisma.user.upsert({
    where: {authId: claims.sub},
    // Already registered (e.g. a double submit): leave the existing row as-is.
    update: {},
    create: {authId: claims.sub, email, role, agreedAt: new Date()},
  });

  redirect(landingPathForRole(role));
}
