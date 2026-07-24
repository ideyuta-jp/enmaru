import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {notFound} from 'next/navigation';

import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import SectionHeading from '@/components/SectionHeading';
import SessionHeader from '@/components/SessionHeader';
import {getPublishedSeekerDetail} from '@/server/seeker';
import {formatSeekerPreferredArea} from '@/types/Seeker';

// Nursery-facing seeker detail. Guarded by the (nursery) layout;
// getPublishedSeekerDetail guards again and returns null for missing/unpublished
// profiles, which we map to notFound (no existence disclosure).
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{id: string}>;
}

// Wrapping row of neutral chips for a list of short public values (resolves to
// nothing when the list is empty). Neutral palette keeps the accent colour rare.
function ChipRow({values}: {values: string[]}) {
  if (values.length === 0) return null;
  return (
    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
      {values.map((v) => (
        <Chip key={v} label={v} size="small" sx={{fontSize: '0.75rem'}} />
      ))}
    </Box>
  );
}

export default async function NurserySeekerDetailPage({params}: Props) {
  const {id} = await params;
  const seeker = await getPublishedSeekerDetail(id);

  if (!seeker) notFound();

  const area = formatSeekerPreferredArea(seeker);
  const preferredStyle = [
    ...seeker.preferredPeriod,
    ...seeker.preferredTimeSlot,
  ];

  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="sm">
        <Box sx={{mb: 3}}>
          <Typography
            variant="h1"
            sx={{fontSize: {xs: '1.375rem', md: '1.75rem'}, mb: 1}}
          >
            {seeker.displayName}
          </Typography>
          {area && (
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
              <LocationOnIcon sx={{fontSize: 16, color: '#AAAAAA'}} />
              <Typography variant="body2" color="text.secondary">
                希望エリア: {area}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{mb: 3}} />

        {(seeker.licenses.length > 0 || seeker.experienceYears) && (
          <Box sx={{mb: 3}}>
            <SectionHeading>資格・経験</SectionHeading>
            {seeker.licenses.length > 0 && (
              <Box sx={{mb: seeker.experienceYears ? 1.5 : 0}}>
                <ChipRow values={seeker.licenses} />
              </Box>
            )}
            {seeker.experienceYears && (
              <Typography variant="body2">
                保育経験: {seeker.experienceYears}
              </Typography>
            )}
          </Box>
        )}

        {(seeker.skills.length > 0 || seeker.skillsNote) && (
          <Box sx={{mb: 3}}>
            <SectionHeading>得意分野</SectionHeading>
            {seeker.skills.length > 0 && (
              <Box sx={{mb: seeker.skillsNote ? 1.5 : 0}}>
                <ChipRow values={seeker.skills} />
              </Box>
            )}
            {seeker.skillsNote && (
              <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>
                {seeker.skillsNote}
              </Typography>
            )}
          </Box>
        )}

        {preferredStyle.length > 0 && (
          <Box sx={{mb: 3}}>
            <SectionHeading>希望勤務スタイル</SectionHeading>
            <ChipRow values={preferredStyle} />
          </Box>
        )}

        {seeker.preferredAgeGroups.length > 0 && (
          <Box sx={{mb: 3}}>
            <SectionHeading>関わりたい年齢層</SectionHeading>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
              {seeker.preferredAgeGroups.map((group) => (
                <Typography key={group} variant="body2">
                  ・{group}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {seeker.values && (
          <Box sx={{mb: 3}}>
            <SectionHeading>大切にしていること</SectionHeading>
            <Typography variant="body1" sx={{whiteSpace: 'pre-wrap'}}>
              {seeker.values}
            </Typography>
          </Box>
        )}

        {seeker.bio && (
          <Box sx={{mb: 3}}>
            <SectionHeading>自己紹介</SectionHeading>
            <Typography variant="body1" sx={{whiteSpace: 'pre-wrap'}}>
              {seeker.bio}
            </Typography>
          </Box>
        )}

        {seeker.messageToNursery && (
          <Box sx={{mb: 3}}>
            <SectionHeading>園の方へひとこと</SectionHeading>
            <Typography variant="body1" sx={{whiteSpace: 'pre-wrap'}}>
              {seeker.messageToNursery}
            </Typography>
          </Box>
        )}

        <Button href="/nursery/seekers" variant="outlined" sx={{mt: 1}}>
          ← 保育士一覧に戻る
        </Button>
      </PageContainer>
      <Footer />
    </>
  );
}
