import Box from '@mui/material/Box';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PageContainer from '@/components/PageContainer';
import SectionHeading from '@/components/SectionHeading';
import StatusChip from '@/components/StatusChip';
import {listSeekerApplications} from '@/server/application';

export default async function ApplicationsPage() {
  const applications = await listSeekerApplications();

  return (
    <>
      <Header role="SEEKER" />
      <PageContainer>
        <SectionHeading>応募履歴</SectionHeading>

        {applications.length === 0 ? (
          <Box sx={{textAlign: 'center', py: 8}}>
            <Typography color="text.secondary" sx={{mb: 2}}>
              まだ応募履歴がありません
            </Typography>
            <MuiLink
              href="/nurseries"
              variant="body2"
              underline="always"
              sx={{color: '#F4A7B9'}}
            >
              保育園を探す
            </MuiLink>
          </Box>
        ) : (
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
            {applications.map((app) => (
              <Box
                key={app.id}
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
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {app.nurseryName}
                    </Typography>
                    <Typography variant="subtitle2" sx={{fontWeight: 700}}>
                      {app.jobTitle}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(app.workDate).toLocaleDateString('ja-JP')} /{' '}
                      {app.workTimeStart}〜{app.workTimeEnd}
                    </Typography>
                  </Box>
                  <StatusChip
                    engagementStatus={app.engagementStatus}
                    reviewStatus={app.reviewStatus}
                  />
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{display: 'block', mt: 1}}
                >
                  応募日: {new Date(app.appliedAt).toLocaleDateString('ja-JP')}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </PageContainer>
      <Footer />
    </>
  );
}
