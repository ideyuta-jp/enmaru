import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import SectionHeading from '@/components/SectionHeading';
import SessionHeader from '@/components/SessionHeader';
import {listNurseryJobs} from '@/server/job';
import {JobStatus, type Job} from '@/types/Job';

export default async function NurseryJobsPage() {
  const jobs = await listNurseryJobs();
  const openJobs = jobs.filter((j) => j.status === JobStatus.OPEN);
  const closedJobs = jobs.filter((j) => j.status === JobStatus.CLOSED);

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
                  公開中（{openJobs.length}件）
                </Typography>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                  {openJobs.map((job) => (
                    <JobRow key={job.id} job={job} />
                  ))}
                </Box>
              </Box>
            )}

            {closedJobs.length > 0 && (
              <>
                <Divider sx={{my: 2}} />
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{mb: 1.5, color: '#AAAAAA'}}
                  >
                    終了済み（{closedJobs.length}件）
                  </Typography>
                  <Box
                    sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}
                  >
                    {closedJobs.map((job) => (
                      <JobRow key={job.id} job={job} />
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

const JobRow = ({job}: {job: Job}) => (
  <Box
    sx={{
      p: {xs: 1.5, md: 2},
      bgcolor: '#FAFAFA',
      borderRadius: 2,
      border: '1px solid #E0E0E0',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 1.5,
      flexWrap: 'wrap',
    }}
  >
    <Box sx={{flex: 1, minWidth: 0}}>
      <Typography variant="subtitle2" sx={{fontWeight: 700, mb: 0.5}}>
        {job.title}
      </Typography>
      <Box sx={{display: 'flex', gap: 1.5, flexWrap: 'wrap'}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
          <CalendarTodayIcon sx={{fontSize: 13, color: '#AAAAAA'}} />
          <Typography variant="caption" color="text.secondary">
            {new Date(job.workDate).toLocaleDateString('ja-JP')}
          </Typography>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
          <AccessTimeIcon sx={{fontSize: 13, color: '#AAAAAA'}} />
          <Typography variant="caption" color="text.secondary">
            {job.workTimeStart}〜{job.workTimeEnd}
          </Typography>
        </Box>
        {job.hourlyWage && (
          <Typography variant="caption" color="text.secondary">
            時給{job.hourlyWage.toLocaleString()}円
          </Typography>
        )}
      </Box>
    </Box>
    <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0}}>
      <Chip
        label={job.status === JobStatus.OPEN ? '公開中' : '終了'}
        size="small"
        sx={{
          bgcolor: job.status === JobStatus.OPEN ? '#E8F5E9' : '#F9F9F9',
          color: job.status === JobStatus.OPEN ? '#2E7D32' : '#AAAAAA',
          fontSize: '0.7rem',
        }}
      />
      <Button
        href={`/nursery/jobs/${job.id}/edit`}
        size="small"
        variant="outlined"
        sx={{fontSize: '0.75rem', py: 0.5}}
      >
        編集
      </Button>
    </Box>
  </Box>
);
