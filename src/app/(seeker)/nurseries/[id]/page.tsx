import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {notFound} from 'next/navigation';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PageContainer from '@/components/PageContainer';
import SectionHeading from '@/components/SectionHeading';
import {getPublishedNursery} from '@/server/nursery';

interface Props {
  params: Promise<{id: string}>;
}

export default async function SeekerNurseryDetailPage({params}: Props) {
  const {id} = await params;
  const nursery = await getPublishedNursery(id);

  if (!nursery) notFound();

  const rating = nursery.rating;

  return (
    <>
      <Header role="SEEKER" />
      <PageContainer maxWidth="md">
        <Box sx={{mb: 3}}>
          <Typography
            variant="h1"
            sx={{fontSize: {xs: '1.375rem', md: '1.75rem'}, mb: 1}}
          >
            {nursery.nurseryName}
          </Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5}}>
            <LocationOnIcon sx={{fontSize: 16, color: '#AAAAAA'}} />
            <Typography variant="body2" color="text.secondary">
              {nursery.area}
            </Typography>
          </Box>
          {rating && rating.count > 0 && (
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              <Rating
                value={rating.total}
                precision={0.1}
                readOnly
                size="small"
                sx={{
                  '& .MuiRating-iconFilled': {color: '#F4A7B9'},
                  '& .MuiRating-iconEmpty': {color: '#AAAAAA'},
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {rating.total.toFixed(1)} ({rating.count}件)
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{mb: 3}} />

        {nursery.concept && (
          <Box sx={{mb: 3}}>
            <SectionHeading>コンセプト</SectionHeading>
            <Typography variant="body1" sx={{whiteSpace: 'pre-wrap'}}>
              {nursery.concept}
            </Typography>
          </Box>
        )}

        {nursery.policy && (
          <Box sx={{mb: 3}}>
            <SectionHeading>保育方針</SectionHeading>
            <Typography variant="body1" sx={{whiteSpace: 'pre-wrap'}}>
              {nursery.policy}
            </Typography>
          </Box>
        )}

        <Box sx={{mb: 3}}>
          <SectionHeading subtitle={`${nursery.jobPostings.length}件`}>
            現在の募集
          </SectionHeading>
          {nursery.jobPostings.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              現在募集中の求人はありません
            </Typography>
          ) : (
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
              {nursery.jobPostings.map((job) => (
                <Card key={job.id} sx={{border: '1px solid #E0E0E0'}}>
                  <CardContent sx={{p: {xs: 1.5, md: 2}}}>
                    <Typography
                      variant="subtitle2"
                      sx={{fontWeight: 700, mb: 1}}
                    >
                      {job.title}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1.5,
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{display: 'flex', alignItems: 'center', gap: 0.5}}
                      >
                        <CalendarTodayIcon
                          sx={{fontSize: 13, color: '#AAAAAA'}}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(job.workDate).toLocaleDateString('ja-JP')}
                        </Typography>
                      </Box>
                      <Box
                        sx={{display: 'flex', alignItems: 'center', gap: 0.5}}
                      >
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
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{mb: 1.5, fontSize: '0.8rem'}}
                    >
                      {job.workContent}
                    </Typography>
                    {/* TODO(#7 follow-up): hide / disable when the seeker has
                        already applied to this posting. */}
                    <Button
                      href={`/applications/new?jobId=${job.id}`}
                      variant="contained"
                      size="small"
                      sx={{fontSize: '0.8rem'}}
                    >
                      この募集に応募する
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </PageContainer>
      <Footer />
    </>
  );
}
