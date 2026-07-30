import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import SectionHeading from '@/components/SectionHeading';
import SeekerPublicProfile from '@/components/SeekerPublicProfile';
import SessionHeader from '@/components/SessionHeader';
import {getSeekerProfileInput} from '@/server/seeker';

export const metadata: Metadata = {
  title: 'プロフィールプレビュー',
};

export const dynamic = 'force-dynamic';

const LabeledBlock = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <Box>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{display: 'block', mb: 0.25}}
    >
      {label}
    </Typography>
    {children}
  </Box>
);

export default async function ProfilePreviewPage() {
  const profile = await getSeekerProfileInput();
  if (!profile) redirect('/profile');

  // Explicit public projection: hand SeekerPublicProfile only the fields a
  // nursery can see, so the private ones (realName / blankYears / experience /
  // ngConditions*) never even reach the shared component.
  const publicView = {
    displayName: profile.displayName,
    preferredPrefecture: profile.preferredPrefecture,
    preferredCity: profile.preferredCity,
    licenses: profile.licenses,
    experienceYears: profile.experienceYears,
    skills: profile.skills,
    skillsNote: profile.skillsNote,
    preferredPeriod: profile.preferredPeriod,
    preferredTimeSlot: profile.preferredTimeSlot,
    preferredAgeGroups: profile.preferredAgeGroups,
    values: profile.values,
    bio: profile.bio,
    messageToNursery: profile.messageToNursery,
  };

  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="sm">
        <SectionHeading subtitle="公開すると、保育園にはこのように見えます">
          プロフィールプレビュー
        </SectionHeading>

        {/* 公開範囲: 園向け詳細ページと同じコンポーネントを描画するので、
            プレビューと実際に園から見える内容は乖離しない。
            TODO: The post-match view (MatchCard in
            (nursery)/nursery/applications/page.tsx) still has its own layout;
            unify it with SeekerPublicProfile + the match-only block below so
            the matched view cannot drift either. */}
        <Box
          sx={{
            p: {xs: 2, md: 3},
            bgcolor: '#FAFAFA',
            borderRadius: 2,
            border: '1px solid #E0E0E0',
          }}
        >
          <SeekerPublicProfile seeker={publicView} />

          {/* 本名・ブランク期間・職務経歴（マッチング相手のみ） */}
          {(profile.realName || profile.blankYears || profile.experience) && (
            <>
              <Divider sx={{mb: 3}} />
              <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                <Typography variant="caption" color="text.secondary">
                  以下はマッチング成立後に開示されます
                </Typography>
                {profile.realName && (
                  <LabeledBlock label="本名">
                    <Typography variant="body2">{profile.realName}</Typography>
                  </LabeledBlock>
                )}
                {profile.blankYears && (
                  <LabeledBlock label="ブランク期間">
                    <Typography variant="body2">
                      {profile.blankYears}
                    </Typography>
                  </LabeledBlock>
                )}
                {profile.experience && (
                  <LabeledBlock label="職務経歴">
                    <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>
                      {profile.experience}
                    </Typography>
                  </LabeledBlock>
                )}
              </Box>
            </>
          )}
        </Box>

        <Button href="/profile" variant="outlined" sx={{mt: 3}}>
          ← プロフィール編集に戻る
        </Button>
      </PageContainer>
      <Footer />
    </>
  );
}
