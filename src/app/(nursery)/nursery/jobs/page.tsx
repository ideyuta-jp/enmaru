import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';

import Footer from '@/components/Footer';
import NurseryJobRow from '@/components/NurseryJobRow';
import PageContainer from '@/components/PageContainer';
import SectionHeading from '@/components/SectionHeading';
import SessionHeader from '@/components/SessionHeader';
import {listNurseryJobs} from '@/server/job';
import {JobState} from '@/types/Job';

export default async function NurseryJobsPage() {
  const jobs = await listNurseryJobs();
  const openJobs = jobs.filter((j) => j.state === JobState.OPEN);
  const inactiveJobs = jobs.filter((j) => j.state !== JobState.OPEN);

  return (
    <>
      <SessionHeader />
      <PageContainer>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <SectionHeading>募集管理</SectionHeading>
          <Button
            href="/nursery/jobs/new"
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
          >
            新規作成
          </Button>
        </Box>

        {jobs.length === 0 ? (
          <Box sx={{textAlign: 'center', py: 8}}>
            <Typography color="text.secondary" sx={{mb: 2}}>
              まだ募集情報がありません
            </Typography>
            <Button href="/nursery/jobs/new" variant="contained">
              最初の募集を作成する
            </Button>
          </Box>
        ) : (
          <>
            {openJobs.length > 0 && (
              <Box sx={{mb: 3}}>
                <Typography
                  variant="subtitle2"
                  sx={{mb: 1.5, color: '#666666'}}
                >
                  募集中（{openJobs.length}件）
                </Typography>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                  {openJobs.map((job) => (
                    <NurseryJobRow key={job.id} job={job} />
                  ))}
                </Box>
              </Box>
            )}

            {inactiveJobs.length > 0 && (
              <>
                <Divider sx={{my: 2}} />
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{mb: 1.5, color: '#AAAAAA'}}
                  >
                    終了済み（{inactiveJobs.length}件）
                  </Typography>
                  <Box
                    sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}
                  >
                    {inactiveJobs.map((job) => (
                      <NurseryJobRow key={job.id} job={job} />
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
