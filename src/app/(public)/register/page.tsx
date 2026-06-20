import type {Metadata} from 'next';
import {redirect} from 'next/navigation';

import PageContainer from '@/components/PageContainer';
import RegisterForm from '@/components/RegisterForm';
import {getAuthContext} from '@/lib/logto';
import {getCurrentUser, landingPathForRole} from '@/server/auth';

export const metadata: Metadata = {
  title: '新規登録',
};

// Reads the Logto session, so it must render per-request (never prerendered).
export const dynamic = 'force-dynamic';

// Registration runs after Logto authenticates the person (Logto owns the
// credential step). Three cases:
//   - not signed in   -> hand off to Logto via /login (no intermediate screen);
//                        a brand-new account returns here authenticated
//   - signed in, new   -> pick role + agree to terms (RegisterForm)
//   - already a User   -> nothing to do, go to the dashboard
export default async function RegisterPage() {
  const {isAuthenticated} = await getAuthContext();
  if (!isAuthenticated) redirect('/login');

  const user = await getCurrentUser();
  if (user) redirect(landingPathForRole(user.role));

  return (
    <PageContainer maxWidth="sm">
      <RegisterForm />
    </PageContainer>
  );
}
