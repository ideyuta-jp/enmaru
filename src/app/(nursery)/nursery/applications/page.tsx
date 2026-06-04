import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PageContainer from '@/components/PageContainer';
import SectionHeading from '@/components/SectionHeading';
import StatusChip from '@/components/StatusChip';
import {listNurseryMatches} from '@/server/match';
import type {NurseryMatch} from '@/types/Match';

export default async function NurseryApplicationsPage() {
  const matches = await listNurseryMatches();
  const newMatches = matches.filter((m) => m.status === 'APPLIED');
  const otherMatches = matches.filter((m) => m.status !== 'APPLIED');

  return (
    <>
      <Header role="NURSERY" />
      <PageContainer>
        <SectionHeading subtitle="保育士の本名はマッチング成立後に開示されます">
          応募管理
        </SectionHeading>

        {matches.length === 0 ? (
          <Box sx={{textAlign: 'center', py: 8}}>
            <Typography color="text.secondary">まだ応募がありません</Typography>
          </Box>
        ) : (
          <>
            {newMatches.length > 0 && (
              <Box sx={{mb: 3}}>
                <Typography
                  variant="subtitle2"
                  sx={{mb: 1.5, fontWeight: 700, color: '#F4A7B9'}}
                >
                  新着応募（{newMatches.length}件）
                </Typography>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                  {newMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </Box>
              </Box>
            )}

            {otherMatches.length > 0 && (
              <>
                {newMatches.length > 0 && <Divider sx={{my: 2}} />}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{mb: 1.5, color: '#666666'}}
                  >
                    その他（{otherMatches.length}件）
                  </Typography>
                  <Box
                    sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}
                  >
                    {otherMatches.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </Box>
                </Box>
              </>
            )}
          </>
        )}
      </PageContainer>
      <Footer />
    </>
  );
}

const MatchCard = ({match}: {match: NurseryMatch}) => (
  <Box
    sx={{
      p: {xs: 1.5, md: 2},
      bgcolor: '#FAFAFA',
      borderRadius: 2,
      border: '1px solid #E0E0E0',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 1,
        mb: 1,
      }}
    >
      <Box>
        <Typography variant="subtitle2" sx={{fontWeight: 700}}>
          {match.seekerDisplayName}
        </Typography>
        {match.seekerPreferredStyle.length > 0 && (
          <Box sx={{display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5}}>
            {match.seekerPreferredStyle.map((s) => (
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
      <StatusChip status={match.status} />
    </Box>

    <Typography variant="caption" color="text.secondary">
      {match.jobTitle} / {new Date(match.workDate).toLocaleDateString('ja-JP')}{' '}
      {match.workTimeStart}〜{match.workTimeEnd}
    </Typography>

    {match.applyMessage && (
      <Box
        sx={{
          mt: 1,
          p: 1,
          bgcolor: '#FFFFFF',
          borderRadius: 1,
          border: '1px solid #F0F0F0',
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{display: 'block', mb: 0.25}}
        >
          応募メッセージ
        </Typography>
        <Typography
          variant="body2"
          sx={{fontSize: '0.8rem', whiteSpace: 'pre-wrap'}}
        >
          {match.applyMessage}
        </Typography>
      </Box>
    )}

    <Box sx={{display: 'flex', gap: 1.5, mt: 1}}>
      <Typography variant="caption" color="text.secondary">
        応募日: {new Date(match.appliedAt).toLocaleDateString('ja-JP')}
      </Typography>
      {match.lineContactOk && (
        <Typography variant="caption" sx={{color: '#2E7D32'}}>
          LINE連絡OK
        </Typography>
      )}
    </Box>
  </Box>
);
