import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PageContainer from '@/components/PageContainer';
import SectionHeading from '@/components/SectionHeading';
import {getSeekerProfileInput} from '@/server/seeker';

export const metadata: Metadata = {
  title: 'プロフィールプレビュー',
};

export const dynamic = 'force-dynamic';

export default async function ProfilePreviewPage() {
  const profile = await getSeekerProfileInput();
  if (!profile) redirect('/profile');

  return (
    <>
      <Header role="SEEKER" />
      <PageContainer maxWidth="sm">
        <SectionHeading subtitle="保育園からはこのように見えます">
          プロフィールプレビュー
        </SectionHeading>

        <Box
          sx={{
            p: {xs: 2, md: 3},
            bgcolor: '#FAFAFA',
            borderRadius: 2,
            border: '1px solid #E0E0E0',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{fontWeight: 700}}>
              {profile.displayName}
            </Typography>
            {profile.preferredStyle.length > 0 && (
              <Box sx={{display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.75}}>
                {profile.preferredStyle.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    size="small"
                    sx={{fontSize: '0.65rem', height: 20}}
                  />
                ))}
              </Box>
            )}
          </Box>

          {(profile.blankYears || profile.experience) && (
            <>
              <Divider />
              <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                {profile.blankYears && (
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{display: 'block', mb: 0.25}}
                    >
                      ブランク期間
                    </Typography>
                    <Typography variant="body2">{profile.blankYears}</Typography>
                  </Box>
                )}
                {profile.experience && (
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{display: 'block', mb: 0.25}}
                    >
                      職務経歴
                    </Typography>
                    <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>
                      {profile.experience}
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}

          {(profile.bio || profile.skills) && (
            <>
              <Divider />
              <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                {profile.bio && (
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{display: 'block', mb: 0.25}}
                    >
                      自己紹介
                    </Typography>
                    <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>
                      {profile.bio}
                    </Typography>
                  </Box>
                )}
                {profile.skills && (
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{display: 'block', mb: 0.25}}
                    >
                      経験・スキル
                    </Typography>
                    <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>
                      {profile.skills}
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}
        </Box>

        <Button
          component={NextLink}
          href="/profile"
          variant="outlined"
          sx={{mt: 3}}
        >
          ← プロフィール編集に戻る
        </Button>
      </PageContainer>
      <Footer />
    </>
  );
}
