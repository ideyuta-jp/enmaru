import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import PageContainer from '@/components/PageContainer';
import RegisterForm from '@/components/RegisterForm';
import {getAuthContext} from '@/lib/logto';
import {getCurrentUser, landingPathForRole} from '@/server/auth';
import {signIn} from '@/server/auth-actions';

export const metadata: Metadata = {
  title: '新規登録',
};

// Reads the Logto session, so it must render per-request (never prerendered).
export const dynamic = 'force-dynamic';

// Registration runs after Logto authenticates the person (Logto owns the
// credential step). Three cases:
//   - not signed in   -> hand off to Logto to create / sign in the account
//   - signed in, new   -> pick role + agree to terms (RegisterForm)
//   - already a User   -> nothing to do, go to the dashboard
export default async function RegisterPage() {
  const {isAuthenticated} = await getAuthContext();

  if (!isAuthenticated) {
    return (
      <PageContainer maxWidth="sm">
        <Box sx={{textAlign: 'center', py: {xs: 4, md: 6}}}>
          <Typography
            variant="h1"
            sx={{fontSize: {xs: '1.5rem', md: '1.75rem'}, mb: 1}}
          >
            新規登録
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{mb: 4}}>
            まずアカウントを作成（またはログイン）します
          </Typography>
          <Box component="form" action={signIn}>
            <Button type="submit" variant="contained" fullWidth sx={{py: 1.25}}>
              アカウント作成に進む
            </Button>
          </Box>
        </Box>
      </PageContainer>
    );
  }

  const user = await getCurrentUser();
  if (user) redirect(landingPathForRole(user.role));

  return (
    <PageContainer maxWidth="sm">
      <RegisterForm />
    </PageContainer>
  );
}
