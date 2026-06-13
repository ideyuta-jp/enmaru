import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import PageContainer from '@/components/PageContainer';
import {getCurrentUser, landingPathForRole} from '@/server/auth';
import {signIn} from '@/server/auth-actions';

export const metadata: Metadata = {
  title: 'ログイン',
};

// Reads the Logto session, so it must render per-request (never prerendered).
export const dynamic = 'force-dynamic';

// Credentials are handled by Logto's hosted sign-in screen, so this page is just
// the entry point that hands off to it. Already-registered users skip straight
// to their dashboard.
export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(landingPathForRole(user.role));

  return (
    <PageContainer maxWidth="sm">
      <Box sx={{textAlign: 'center', py: {xs: 4, md: 6}}}>
        <Typography
          variant="h1"
          sx={{fontSize: {xs: '1.5rem', md: '1.75rem'}, mb: 1}}
        >
          ログイン
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{mb: 4}}>
          えんまーるにログインします
        </Typography>
        <Box component="form" action={signIn}>
          <Button type="submit" variant="contained" fullWidth sx={{py: 1.25}}>
            ログインに進む
          </Button>
        </Box>
      </Box>
    </PageContainer>
  );
}
