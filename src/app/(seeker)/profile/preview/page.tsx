import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import SectionHeading from '@/components/SectionHeading';
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

  const preferredArea = [profile.preferredPrefecture, profile.preferredCity]
    .filter(Boolean)
    .join(' ');

  const allPreferredStyle = [
    ...profile.preferredPeriod,
    ...profile.preferredTimeSlot,
  ];

  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="sm">
        <SectionHeading subtitle="マッチング成立後、保育園にはこのように見えます">
          プロフィールプレビュー
        </SectionHeading>

        {/* TODO: This seeker card replicates the MatchCard layout in
            (nursery)/nursery/applications/page.tsx. Extract a shared
            SeekerProfileCard used by both so this preview cannot drift
            from the real nursery-facing card. */}
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
          {/* 名前・エリア・勤務スタイルチップ */}
          <Box>
            <Typography variant="subtitle1" sx={{fontWeight: 700}}>
              {profile.displayName}
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
                sx={{ml: 0.5, fontWeight: 400}}
              >
                （{profile.realName}）
              </Typography>
            </Typography>
            {preferredArea && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{display: 'block', mt: 0.25}}
              >
                希望エリア: {preferredArea}
              </Typography>
            )}
            {allPreferredStyle.length > 0 && (
              <Box sx={{display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.75}}>
                {allPreferredStyle.map((s) => (
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

          {/* 資格・経験 */}
          {(profile.licenses.length > 0 || profile.experienceYears) && (
            <>
              <Divider />
              <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                {profile.licenses.length > 0 && (
                  <LabeledBlock label="保有資格">
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 0.5,
                        flexWrap: 'wrap',
                        mt: 0.25,
                      }}
                    >
                      {profile.licenses.map((l) => (
                        <Chip
                          key={l}
                          label={l}
                          size="small"
                          sx={{fontSize: '0.65rem', height: 20}}
                        />
                      ))}
                    </Box>
                  </LabeledBlock>
                )}
                {profile.experienceYears && (
                  <LabeledBlock label="保育経験">
                    <Typography variant="body2">
                      {profile.experienceYears}
                    </Typography>
                  </LabeledBlock>
                )}
              </Box>
            </>
          )}

          {/* 得意分野 */}
          {(profile.skills.length > 0 || profile.skillsNote) && (
            <>
              <Divider />
              <Box>
                <LabeledBlock label="得意分野">
                  {profile.skills.length > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 0.5,
                        flexWrap: 'wrap',
                        mt: 0.25,
                        mb: profile.skillsNote ? 0.75 : 0,
                      }}
                    >
                      {profile.skills.map((s) => (
                        <Chip
                          key={s}
                          label={s}
                          size="small"
                          sx={{fontSize: '0.65rem', height: 20}}
                        />
                      ))}
                    </Box>
                  )}
                  {profile.skillsNote && (
                    <Typography
                      variant="body2"
                      sx={{whiteSpace: 'pre-wrap', mt: 0.5}}
                    >
                      {profile.skillsNote}
                    </Typography>
                  )}
                </LabeledBlock>
              </Box>
            </>
          )}

          {/* 大切にしていること */}
          {profile.values && (
            <>
              <Divider />
              <LabeledBlock label="大切にしていること">
                <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>
                  {profile.values}
                </Typography>
              </LabeledBlock>
            </>
          )}

          {/* 自己紹介 */}
          {profile.bio && (
            <>
              <Divider />
              <LabeledBlock label="自己紹介">
                <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>
                  {profile.bio}
                </Typography>
              </LabeledBlock>
            </>
          )}

          {/* 園の方へひとこと */}
          {profile.messageToNursery && (
            <>
              <Divider />
              <LabeledBlock label="園の方へひとこと">
                <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>
                  {profile.messageToNursery}
                </Typography>
              </LabeledBlock>
            </>
          )}

          {/* ブランク期間・職務経歴（マッチング相手のみ） */}
          {(profile.blankYears || profile.experience) && (
            <>
              <Divider />
              <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                <Typography variant="caption" color="text.secondary">
                  以下はマッチング成立後に開示されます
                </Typography>
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
